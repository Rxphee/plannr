import type { IncomingMessage, ServerResponse } from "node:http";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { HttpException, Logger } from "@nestjs/common";
import { MAX_PAGE_SIZE } from "@src/common/pagination.args.js";
import { IssuePriority, IssueStatus, IssueType } from "@src/issues/entities/issue.entity.js";
import { IssueView } from "@src/issues/issue-views.js";
import { ProjectStatus } from "@src/projects/entities/project.entity.js";
import type { User } from "@src/users/user.entity.js";
import { z } from "zod";

import type { McpToolsService } from "./mcp-tools.service.js";

const logger = new Logger("McpServer");

// Descriptions stay short, every client loads all tool definitions on start
const projectKey = z.string().describe("Project key, e.g. WEB");
const issueKey = z.string().describe("Issue key, e.g. WEB-12");
const epic = z.string().describe('Epic name or ID, e.g. "Design"');
const pagination = {
    offset: z.number().int().min(0).optional(),
    limit: z.number().int().min(1).max(MAX_PAGE_SIZE).optional().describe("Default 25"),
};
const labelNames = z.array(z.string()).optional();
const dueDate = z.string().nullable().optional().describe("YYYY-MM-DD, null removes it");

const readOnly = { readOnlyHint: true, openWorldHint: false };

interface McpRequest {
    request: IncomingMessage;
    response: ServerResponse;
    // The parsed JSON body
    body: unknown;
    tools: McpToolsService;
    user: User;
}

// Stateless: every request gets its own server and transport, so nothing is kept between requests and the tools act as the user of the request.
// Answers are plain JSON instead of an event stream, the tools are quick and send no progress.
export async function handleMcpRequest({ request, response, body, tools, user }: McpRequest): Promise<void> {
    const server = createMcpServer(tools, user);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    response.on("close", () => {
        void transport.close();
        void server.close();
    });
    await server.connect(transport);
    await transport.handleRequest(request, response, body);
}

function createMcpServer(tools: McpToolsService, user: User): McpServer {
    const server = new McpServer(
        { name: "plannr", version: "1.0.0" },
        { instructions: "Plannr is an issue tracker: projects (key like WEB) contain epics, which group issues (key like WEB-12)." },
    );

    server.registerTool(
        "list_projects",
        {
            description: "List projects. Line: key · status · name",
            inputSchema: {
                statuses: z.array(z.enum(ProjectStatus)).optional().describe("Default active and paused"),
                search: z.string().optional().describe("Part of name or key"),
                ...pagination,
            },
            annotations: readOnly,
        },
        async (args) => runTool(() => tools.listProjects(args, user)),
    );

    server.registerTool(
        "list_epics",
        {
            description: "List the epics of a project. Line: name · done/total issues · id",
            inputSchema: { project: projectKey, search: z.string().optional().describe("Part of the name"), ...pagination },
            annotations: readOnly,
        },
        async (args) => runTool(() => tools.listEpics(args, user)),
    );

    server.registerTool(
        "list_issues",
        {
            description: "List issues, newest first. Line: key · type · priority · status · due date · title · #labels",
            inputSchema: {
                project: projectKey.optional().describe("Project key; without, all active and paused projects"),
                view: z
                    .enum(IssueView)
                    .optional()
                    .describe("Open issues only. focus: high priority, due: soonest first, pullRequests: with a PR link"),
                epic: epic.optional(),
                statuses: z.array(z.enum(IssueStatus)).optional().describe("Default todo and inProgress, none with a view"),
                types: z.array(z.enum(IssueType)).optional(),
                priorities: z.array(z.enum(IssuePriority)).optional(),
                labels: labelNames.describe("Label names, any of them"),
                search: z.string().optional().describe("Part of the title, or an issue number"),
                ...pagination,
            },
            annotations: readOnly,
        },
        async (args) => runTool(() => tools.listIssues(args, user)),
    );

    server.registerTool(
        "get_issue",
        {
            description: "Get an issue with epic, links and Markdown description",
            inputSchema: { key: issueKey },
            annotations: readOnly,
        },
        async (args) => runTool(() => tools.getIssue(args, user)),
    );

    server.registerTool(
        "create_issue",
        {
            description: "Create an issue, in the epic General unless another is given",
            inputSchema: {
                project: projectKey,
                title: z.string(),
                epic: epic.optional(),
                type: z.enum(IssueType).optional().describe("Default task"),
                priority: z.enum(IssuePriority).optional().describe("Default normal"),
                dueDate,
                description: z.string().optional().describe("Markdown"),
                labels: labelNames.describe("Label names"),
            },
            annotations: { openWorldHint: false },
        },
        async (args) => runTool(() => tools.createIssue(args, user)),
    );

    server.registerTool(
        "update_issue",
        {
            description: "Change an issue. Only the given fields change",
            inputSchema: {
                key: issueKey,
                title: z.string().optional(),
                epic: epic.optional(),
                type: z.enum(IssueType).optional(),
                status: z.enum(IssueStatus).optional(),
                priority: z.enum(IssuePriority).optional(),
                dueDate,
                description: z.string().optional().describe("Markdown, replaces the old one"),
                addLinks: z.array(z.string()).optional().describe("URLs, e.g. a GitHub pull request"),
                removeLinks: z.array(z.string()).optional().describe("URLs"),
                addLabels: labelNames.describe("Label names"),
                removeLabels: labelNames,
            },
            annotations: { idempotentHint: true, openWorldHint: false },
        },
        async (args) => runTool(() => tools.updateIssue(args, user)),
    );

    return server;
}

// Errors the user can correct, like a wrong key, are shown to the agent, anything else stays in the log
async function runTool(tool: () => Promise<string>): Promise<CallToolResult> {
    try {
        return { content: [{ type: "text", text: await tool() }] };
    } catch (error) {
        if (error instanceof HttpException && error.getStatus() < 500) {
            return { content: [{ type: "text", text: error.message }], isError: true };
        }
        logger.error(error);
        return { content: [{ type: "text", text: "The tool failed unexpectedly" }], isError: true };
    }
}
