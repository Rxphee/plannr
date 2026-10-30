import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MAX_PAGE_SIZE } from "@src/common/pagination.args.js";
import { EpicsArgs } from "@src/epics/dto/epics.args.js";
import type { Epic } from "@src/epics/entities/epic.entity.js";
import { EpicsService } from "@src/epics/epics.service.js";
import { CreateIssueInput } from "@src/issues/dto/create-issue.input.js";
import { IssueLinkInput } from "@src/issues/dto/issue-link.input.js";
import { IssuesArgs } from "@src/issues/dto/issues.args.js";
import { UpdateIssueInput } from "@src/issues/dto/update-issue.input.js";
import { type Issue, IssuePriority, IssueStatus, IssueType } from "@src/issues/entities/issue.entity.js";
import { IssueView } from "@src/issues/issue-views.js";
import { IssuesService } from "@src/issues/issues.service.js";
import { ProjectsArgs } from "@src/projects/dto/projects.args.js";
import { type Project, ProjectStatus } from "@src/projects/entities/project.entity.js";
import { ProjectsService } from "@src/projects/projects.service.js";
import type { User } from "@src/users/user.entity.js";
import { isUUID } from "class-validator";

import { formatEpicLine, formatIssueDetails, formatIssueLine, formatPage, formatProjectLine } from "./mcp-format.js";
import { validateInput } from "./validate-input.js";

const DEFAULT_TOOL_PAGE_SIZE = 25;
const OPEN_STATUSES = [IssueStatus.todo, IssueStatus.inProgress];
const UNARCHIVED_STATUSES = [ProjectStatus.active, ProjectStatus.paused];

interface PageArgs {
    offset?: number;
    limit?: number;
}

interface ListProjectsArgs extends PageArgs {
    statuses?: ProjectStatus[];
    search?: string;
}

interface ListEpicsArgs extends PageArgs {
    project: string;
    search?: string;
}

// Labels are added here once the API has them
interface ListIssuesArgs extends PageArgs {
    // Without a project, the issues of all active and paused projects
    project?: string;
    view?: IssueView;
    epic?: string;
    statuses?: IssueStatus[];
    types?: IssueType[];
    priorities?: IssuePriority[];
    search?: string;
}

interface CreateIssueArgs {
    project: string;
    title: string;
    epic?: string;
    type?: IssueType;
    priority?: IssuePriority;
    dueDate?: string | null;
    description?: string;
}

interface UpdateIssueArgs {
    key: string;
    title?: string;
    epic?: string;
    type?: IssueType;
    status?: IssueStatus;
    priority?: IssuePriority;
    dueDate?: string | null;
    description?: string;
    addLinks?: string[];
    removeLinks?: string[];
}

// The MCP tools as text answers. They call the same services as GraphQL, which check the rights of the user.
@Injectable()
export class McpToolsService {
    constructor(
        private readonly projectsService: ProjectsService,
        private readonly epicsService: EpicsService,
        private readonly issuesService: IssuesService,
    ) {}

    async listProjects(
        { statuses = UNARCHIVED_STATUSES, search, offset = 0, limit = DEFAULT_TOOL_PAGE_SIZE }: ListProjectsArgs,
        user: User,
    ): Promise<string> {
        const args = validateInput(ProjectsArgs, { statuses, search, offset, limit });
        const { nodes, totalCount } = await this.projectsService.findAllVisibleTo(args, user);
        return formatPage({ noun: "projects", offset, lines: nodes.map(formatProjectLine), totalCount });
    }

    async listEpics({ project: projectKey, search, offset = 0, limit = DEFAULT_TOOL_PAGE_SIZE }: ListEpicsArgs, user: User): Promise<string> {
        const project = await this.findProject(projectKey, user);
        const args = validateInput(EpicsArgs, { projectId: project.id, search, offset, limit });
        const { nodes, totalCount } = await this.epicsService.findAll(args, user);
        return formatPage({ noun: "epics", offset, lines: nodes.map(formatEpicLine), totalCount });
    }

    async listIssues(
        {
            project: projectKey,
            view,
            epic,
            // A view shows open issues anyway
            statuses = view ? undefined : OPEN_STATUSES,
            types,
            priorities,
            search,
            offset = 0,
            limit = DEFAULT_TOOL_PAGE_SIZE,
        }: ListIssuesArgs,
        user: User,
    ): Promise<string> {
        const project = projectKey ? await this.findProject(projectKey, user) : undefined;
        if (epic && !project) {
            throw new BadRequestException("An epic belongs to one project, pass the project too");
        }
        const epicIds = project && epic ? [(await this.findEpic(project, epic, user)).id] : undefined;
        const args = validateInput(IssuesArgs, {
            projectId: project?.id,
            view,
            filter: { epicIds, statuses, types, priorities, search },
            offset,
            limit,
        });
        const { nodes, totalCount } = await this.issuesService.findAll(args, user);
        const projectKeys = await this.loadProjectKeys(nodes);
        const lines = nodes.map((issue) => formatIssueLine(projectKeys.get(issue.project.id) ?? "", issue));
        return formatPage({ noun: "issues", offset, lines, totalCount });
    }

    async getIssue({ key }: { key: string }, user: User): Promise<string> {
        const issue = await this.findIssue(key, user);
        const project = await issue.project.loadOrFail();
        const epic = await issue.epic.loadOrFail();
        const links = await issue.links.loadItems();
        return formatIssueDetails({ projectKey: project.key, issue, epicName: epic.name, links });
    }

    async createIssue({ project: projectKey, epic, title, type, priority, dueDate, description }: CreateIssueArgs, user: User): Promise<string> {
        const project = await this.findProject(projectKey, user);
        const epicId = epic ? (await this.findEpic(project, epic, user)).id : undefined;
        const input = validateInput(CreateIssueInput, {
            projectId: project.id,
            epicId,
            title,
            type: type ?? IssueType.task,
            priority: priority ?? IssuePriority.normal,
            dueDate: dueDate ?? null,
            description: description ?? "",
        });
        const issue = await this.issuesService.create(input, user);
        return `Created ${formatIssueLine(project.key, issue)}`;
    }

    async updateIssue({ key, epic, addLinks = [], removeLinks = [], ...fields }: UpdateIssueArgs, user: User): Promise<string> {
        const issue = await this.findIssue(key, user);
        const project = await issue.project.loadOrFail();

        // Everything is checked before the first change, so a wrong argument changes nothing
        const epicId = epic ? (await this.findEpic(project, epic, user)).id : undefined;
        const input = validateInput(UpdateIssueInput, { ...fields, epicId });
        const linksToAdd = addLinks.map((url) => validateInput(IssueLinkInput, { issueId: issue.id, url }));
        const existingLinks = await issue.links.loadItems();
        const linksToRemove = removeLinks.map((url) => {
            const link = existingLinks.find((existingLink) => existingLink.url === url);
            if (!link) {
                throw new BadRequestException(`${key} has no link ${url}`);
            }
            return link;
        });

        const updatedIssue = await this.issuesService.update(issue.id, input, user);
        for (const link of linksToRemove) {
            await this.issuesService.removeLink(link.id, user);
        }
        for (const link of linksToAdd) {
            await this.issuesService.addLink(link, user);
        }
        return `Updated ${formatIssueLine(project.key, updatedIssue)}`;
    }

    // One query per project instead of one per issue, the issues of a list share few projects
    private async loadProjectKeys(issues: Issue[]): Promise<Map<string, string>> {
        const projectKeys = new Map<string, string>();
        for (const { project } of issues) {
            if (!projectKeys.has(project.id)) {
                projectKeys.set(project.id, (await project.loadOrFail()).key);
            }
        }
        return projectKeys;
    }

    private async findProject(key: string, user: User): Promise<Project> {
        const project = await this.projectsService.findOneVisibleTo(key.trim().toUpperCase(), user);
        if (!project) {
            throw new NotFoundException(`The project ${key} does not exist`);
        }
        return project;
    }

    private async findIssue(key: string, user: User): Promise<Issue> {
        const issue = await this.issuesService.findOneByKeyVisibleTo(key.trim().toUpperCase(), user);
        if (!issue) {
            throw new NotFoundException(`The issue ${key} does not exist`);
        }
        return issue;
    }

    // By ID or by name, since agents know epics by name. Names are not unique, so an ambiguous name asks for the ID.
    private async findEpic(project: Project, nameOrId: string, user: User): Promise<Epic> {
        if (isUUID(nameOrId, "4")) {
            return this.epicsService.findOneInProject(nameOrId, project);
        }
        const name = nameOrId.trim().toLowerCase();
        const { nodes } = await this.epicsService.findAll({ projectId: project.id, search: name, offset: 0, limit: MAX_PAGE_SIZE }, user);
        const epics = nodes.filter((epic) => epic.name.toLowerCase() === name);
        if (epics.length === 0) {
            throw new BadRequestException(`The project ${project.key} has no epic "${nameOrId}"`);
        }
        if (epics.length > 1) {
            throw new BadRequestException(`Several epics are named "${nameOrId}", pass the ID from list_epics instead`);
        }
        return epics[0];
    }
}
