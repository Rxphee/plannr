import { createServer, type IncomingMessage, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { text } from "node:stream/consumers";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { Logger, NotFoundException } from "@nestjs/common";
import { User } from "@src/users/user.entity.js";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { handleMcpRequest } from "./mcp-server.js";
import type { McpToolsService } from "./mcp-tools.service.js";

const user = Object.assign(new User(), { firstName: "Erika" });
const tools = {
    listProjects: vi.fn(async () => "Projects 1-1 of 1\nWEB · active · Website Relaunch"),
    getIssue: vi.fn(async () => {
        throw new NotFoundException("The issue WEB-99 does not exist");
    }),
    listIssues: vi.fn(async () => {
        throw new Error("connection to the database lost");
    }),
};

// A real MCP client talks to the HTTP handler, as Claude Code would talk to /api/mcp
describe("handleMcpRequest", () => {
    let server: Server;
    let client: Client;

    beforeAll(async () => {
        server = createServer(async (request, response) => {
            // Like the controller, which answers only POST
            if (request.method !== "POST") {
                response.writeHead(405).end();
                return;
            }
            const body: unknown = JSON.parse(await text(request as IncomingMessage));
            await handleMcpRequest({ request, response, body, tools: tools as unknown as McpToolsService, user });
        });
        await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
        const { port } = server.address() as AddressInfo;

        client = new Client({ name: "test", version: "1.0.0" });
        await client.connect(new StreamableHTTPClientTransport(new URL(`http://127.0.0.1:${port}/api/mcp`)));
    });

    afterAll(async () => {
        await client.close();
        server.close();
    });

    it("offers the tools", async () => {
        const { tools: toolDefinitions } = await client.listTools();
        expect(toolDefinitions.map(({ name }) => name)).toEqual([
            "list_projects",
            "list_epics",
            "list_issues",
            "get_issue",
            "create_issue",
            "update_issue",
        ]);
    });

    it("answers a tool call as the user of the request", async () => {
        const result = await client.callTool({ name: "list_projects", arguments: { search: "web" } });

        expect(result.content).toEqual([{ type: "text", text: "Projects 1-1 of 1\nWEB · active · Website Relaunch" }]);
        expect(tools.listProjects).toHaveBeenCalledWith({ search: "web" }, user);
    });

    it("shows errors the agent can correct", async () => {
        const result = await client.callTool({ name: "get_issue", arguments: { key: "WEB-99" } });

        expect(result).toMatchObject({ isError: true, content: [{ type: "text", text: "The issue WEB-99 does not exist" }] });
    });

    it("hides the details of other errors", async () => {
        vi.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
        const result = await client.callTool({ name: "list_issues", arguments: { project: "WEB" } });

        expect(result).toMatchObject({ isError: true, content: [{ type: "text", text: "The tool failed unexpectedly" }] });
    });
});
