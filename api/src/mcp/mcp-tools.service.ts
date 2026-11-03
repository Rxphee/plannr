import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { MAX_PAGE_SIZE } from "@src/common/pagination.args.js";
import type { SortDirection } from "@src/common/sort.js";
import { CreateEpicInput } from "@src/epics/dto/create-epic.input.js";
import { EpicsArgs } from "@src/epics/dto/epics.args.js";
import { UpdateEpicInput } from "@src/epics/dto/update-epic.input.js";
import type { Epic } from "@src/epics/entities/epic.entity.js";
import { DEFAULT_EPIC_SORT_DIRECTIONS, type EpicSortField } from "@src/epics/epic-sort.js";
import { EpicsService } from "@src/epics/epics.service.js";
import { imageUrl } from "@src/images/image-type.js";
import { ImagesService } from "@src/images/images.service.js";
import { CreateIssueInput } from "@src/issues/dto/create-issue.input.js";
import { IssueLinkInput } from "@src/issues/dto/issue-link.input.js";
import { IssuesArgs } from "@src/issues/dto/issues.args.js";
import { UpdateIssueInput } from "@src/issues/dto/update-issue.input.js";
import { type Issue, IssuePriority, IssueStatus, IssueType } from "@src/issues/entities/issue.entity.js";
import { DEFAULT_ISSUE_SORT_DIRECTIONS, type IssueSortField } from "@src/issues/issue-sort.js";
import { IssueView } from "@src/issues/issue-views.js";
import { IssuesService } from "@src/issues/issues.service.js";
import type { Label } from "@src/labels/entities/label.entity.js";
import { LabelsService } from "@src/labels/labels.service.js";
import { ProjectsArgs } from "@src/projects/dto/projects.args.js";
import { type Project, ProjectStatus } from "@src/projects/entities/project.entity.js";
import { DEFAULT_PROJECT_SORT_DIRECTIONS, type ProjectSortField } from "@src/projects/project-sort.js";
import { ProjectsService } from "@src/projects/projects.service.js";
import { StorageService } from "@src/storage/storage.service.js";
import type { User } from "@src/users/user.entity.js";
import { isUUID } from "class-validator";

import { formatEpicLine, formatIssueDetails, formatIssueLine, formatPage, formatProjectLine, formatUser } from "./mcp-format.js";
import { validateInput } from "./validate-input.js";

const DEFAULT_TOOL_PAGE_SIZE = 25;
const OPEN_STATUSES = [IssueStatus.todo, IssueStatus.inProgress];
const UNARCHIVED_STATUSES = [ProjectStatus.active, ProjectStatus.paused];

interface PageArgs {
    offset?: number;
    limit?: number;
}

interface SortArgs<SortField> {
    sort?: SortField;
    // Without, the default direction of the field
    direction?: SortDirection;
}

interface ListProjectsArgs extends PageArgs, SortArgs<ProjectSortField> {
    statuses?: ProjectStatus[];
    search?: string;
}

interface ListEpicsArgs extends PageArgs, SortArgs<EpicSortField> {
    project: string;
    search?: string;
}

interface CreateEpicArgs {
    project: string;
    name: string;
    description?: string;
}

interface UpdateEpicArgs {
    project: string;
    // Name or ID
    epic: string;
    name?: string;
    description?: string;
}

interface ListIssuesArgs extends PageArgs, SortArgs<IssueSortField> {
    // Without a project, the issues of all active and paused projects
    project?: string;
    view?: IssueView;
    epic?: string;
    statuses?: IssueStatus[];
    types?: IssueType[];
    priorities?: IssuePriority[];
    // Label names, issues with any of them
    labels?: string[];
    search?: string;
}

interface CreateIssueArgs {
    project: string;
    title: string;
    epic?: string;
    // "me", an email or a full name
    assignee?: string | null;
    type?: IssueType;
    priority?: IssuePriority;
    dueDate?: string | null;
    description?: string;
    labels?: string[];
}

interface UpdateIssueArgs {
    key: string;
    title?: string;
    epic?: string;
    // "me", an email or a full name, null unassigns the issue
    assignee?: string | null;
    type?: IssueType;
    status?: IssueStatus;
    priority?: IssuePriority;
    dueDate?: string | null;
    description?: string;
    addLinks?: string[];
    removeLinks?: string[];
    addLabels?: string[];
    removeLabels?: string[];
}

interface UploadImageArgs {
    project: string;
    data: string;
    name?: string;
}

interface LabelChanges {
    key: string;
    issue: Issue;
    addLabels: string[];
    removeLabels: string[];
}

// The MCP tools as text answers. They call the same services as GraphQL, which check the rights of the user.
@Injectable()
export class McpToolsService {
    constructor(
        private readonly projectsService: ProjectsService,
        private readonly epicsService: EpicsService,
        private readonly issuesService: IssuesService,
        private readonly labelsService: LabelsService,
        private readonly imagesService: ImagesService,
        private readonly storage: StorageService,
    ) {}

    // upload_image is only offered when the instance has a storage
    get canUploadImages(): boolean {
        return this.storage.isEnabled;
    }

    // Answers with the Markdown line that shows the image, ready for a description
    async uploadImage({ project: projectKey, data, name = "" }: UploadImageArgs, user: User): Promise<string> {
        const image = await this.imagesService.upload({ projectKey, content: decodeBase64(data) }, user);
        const altText = name.replace(/[[\]\r\n]/g, " ").trim();
        return `![${altText}](${imageUrl(image.id)})`;
    }

    async listProjects(
        { statuses = UNARCHIVED_STATUSES, search, sort, direction, offset = 0, limit = DEFAULT_TOOL_PAGE_SIZE }: ListProjectsArgs,
        user: User,
    ): Promise<string> {
        const args = validateInput(ProjectsArgs, {
            statuses,
            search,
            sort: toSort({ sort, direction }, DEFAULT_PROJECT_SORT_DIRECTIONS),
            offset,
            limit,
        });
        const { nodes, totalCount } = await this.projectsService.findAllVisibleTo(args, user);
        return formatPage({ noun: "projects", offset, lines: nodes.map(formatProjectLine), totalCount });
    }

    async listEpics(
        { project: projectKey, search, sort, direction, offset = 0, limit = DEFAULT_TOOL_PAGE_SIZE }: ListEpicsArgs,
        user: User,
    ): Promise<string> {
        const project = await this.findProject(projectKey, user);
        const args = validateInput(EpicsArgs, {
            projectId: project.id,
            search,
            sort: toSort({ sort, direction }, DEFAULT_EPIC_SORT_DIRECTIONS),
            offset,
            limit,
        });
        const { nodes, totalCount } = await this.epicsService.findAll(args, user);
        return formatPage({ noun: "epics", offset, lines: nodes.map(formatEpicLine), totalCount });
    }

    async createEpic({ project: projectKey, name, description = "" }: CreateEpicArgs, user: User): Promise<string> {
        const project = await this.findProject(projectKey, user);
        const input = validateInput(CreateEpicInput, { projectId: project.id, name, description });
        const epic = await this.epicsService.create(input, user);
        return `Created ${formatEpicLine(epic)}`;
    }

    async updateEpic({ project: projectKey, epic: nameOrId, name, description }: UpdateEpicArgs, user: User): Promise<string> {
        const project = await this.findProject(projectKey, user);
        const epic = await this.findEpic(project, nameOrId, user);
        // The API takes name and description together, so a field that is not given keeps its value
        const input = validateInput(UpdateEpicInput, { name: name ?? epic.name, description: description ?? epic.description });
        const updatedEpic = await this.epicsService.update(epic.id, input, user);
        return `Updated ${formatEpicLine(updatedEpic)}`;
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
            labels,
            search,
            sort,
            direction,
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
        const labelIds = labels ? (await this.findLabels(labels)).map(({ id }) => id) : undefined;
        const args = validateInput(IssuesArgs, {
            projectId: project?.id,
            view,
            filter: { epicIds, statuses, types, priorities, labelIds, search },
            sort: toSort({ sort, direction }, DEFAULT_ISSUE_SORT_DIRECTIONS),
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
        await issue.labels.loadItems();
        await issue.assignee?.load();
        return formatIssueDetails({ projectKey: project.key, issue, epicName: epic.name, links });
    }

    async createIssue(
        { project: projectKey, epic, assignee, title, type, priority, dueDate, description, labels = [] }: CreateIssueArgs,
        user: User,
    ): Promise<string> {
        const project = await this.findProject(projectKey, user);
        const epicId = epic ? (await this.findEpic(project, epic, user)).id : undefined;
        const assigneeId = assignee ? (await this.findAssignee(project, assignee, user)).id : undefined;
        const labelIds = (await this.findLabels(labels)).map(({ id }) => id);
        const input = validateInput(CreateIssueInput, {
            projectId: project.id,
            epicId,
            title,
            type: type ?? IssueType.task,
            priority: priority ?? IssuePriority.normal,
            dueDate: dueDate ?? null,
            description: description ?? "",
            labelIds,
            assigneeId,
        });
        const issue = await this.issuesService.create(input, user);
        return `Created ${formatIssueLine(project.key, issue)}`;
    }

    async updateIssue(
        { key, epic, assignee, addLinks = [], removeLinks = [], addLabels = [], removeLabels = [], ...fields }: UpdateIssueArgs,
        user: User,
    ): Promise<string> {
        const issue = await this.findIssue(key, user);
        const project = await issue.project.loadOrFail();

        // Everything is checked before the first change, so a wrong argument changes nothing
        const epicId = epic ? (await this.findEpic(project, epic, user)).id : undefined;
        const assigneeId = assignee ? (await this.findAssignee(project, assignee, user)).id : assignee;
        const labelIds =
            addLabels.length > 0 || removeLabels.length > 0 ? await this.changeLabelIds({ key, issue, addLabels, removeLabels }) : undefined;
        const input = validateInput(UpdateIssueInput, { ...fields, epicId, assigneeId, labelIds });
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
        await updatedIssue.labels.loadItems();
        await updatedIssue.assignee?.load();
        return `Updated ${formatIssueLine(project.key, updatedIssue)}`;
    }

    // The API replaces the whole set of labels, so the changes are applied to the labels the issue has
    private async changeLabelIds({ key, issue, addLabels, removeLabels }: LabelChanges): Promise<string[]> {
        const currentLabelIds = (await issue.labels.loadItems()).map(({ id }) => id);
        const labelIdsToRemove = new Set<string>();
        for (const label of await this.findLabels(removeLabels)) {
            if (!currentLabelIds.includes(label.id)) {
                throw new BadRequestException(`${key} has no label ${label.name}`);
            }
            labelIdsToRemove.add(label.id);
        }
        const labelIdsToAdd = (await this.findLabels(addLabels)).map(({ id }) => id);
        return [...new Set([...currentLabelIds.filter((id) => !labelIdsToRemove.has(id)), ...labelIdsToAdd])];
    }

    // Names in any case and with or without "#". A wrong name answers with the existing labels, so agents need no tool to list them.
    private async findLabels(names: string[]): Promise<Label[]> {
        if (names.length === 0) {
            return [];
        }
        const allLabels = await this.loadAllLabels();
        const labelsByName = new Map(allLabels.map((label) => [label.name.toLowerCase(), label]));
        return names.map((name) => {
            const label = labelsByName.get(name.trim().replace(/^#/, "").toLowerCase());
            if (!label) {
                const existingNames = allLabels.map((existingLabel) => existingLabel.name).join(", ") || "none";
                throw new BadRequestException(`There is no label "${name}". Labels: ${existingNames}`);
            }
            return label;
        });
    }

    // Labels belong to the whole instance and are few, so they are loaded in full
    private async loadAllLabels(): Promise<Label[]> {
        const labels: Label[] = [];
        for (;;) {
            const { nodes, totalCount } = await this.labelsService.findAll({ offset: labels.length, limit: MAX_PAGE_SIZE });
            labels.push(...nodes);
            if (nodes.length === 0 || labels.length >= totalCount) {
                return labels;
            }
        }
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

    // "me", an email or a full name in any case. A wrong one answers with the people the issue can be assigned to, so agents need no tool to list them.
    private async findAssignee(project: Project, nameOrEmail: string, user: User): Promise<User> {
        const search = nameOrEmail.trim().toLowerCase();
        if (search === "me") {
            return user;
        }
        const assignableUsers = await this.projectsService.findAssignableUsers(project);
        const matches = assignableUsers.filter(
            ({ firstName, lastName, email }) => email.toLowerCase() === search || `${firstName} ${lastName}`.toLowerCase() === search,
        );
        if (matches.length === 0) {
            const people = assignableUsers.map(formatUser).join(", ");
            throw new BadRequestException(`Issues of ${project.key} cannot be assigned to "${nameOrEmail}". Members: ${people}`);
        }
        if (matches.length > 1) {
            throw new BadRequestException(`Several members are named "${nameOrEmail}", pass the email instead`);
        }
        return matches[0];
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

// The sort input of a list query; a direction without a field would be ignored silently, so it is refused
function toSort<SortField extends string>(
    { sort, direction }: SortArgs<SortField>,
    defaultDirections: Record<SortField, SortDirection>,
): { field: SortField; direction: SortDirection } | undefined {
    if (!sort) {
        if (direction) {
            throw new BadRequestException("A direction needs a sort field");
        }
        return undefined;
    }
    return { field: sort, direction: direction ?? defaultDirections[sort] };
}

// Agents often send a data URL (data:image/png;base64,iVBOR…) and break long Base64 into lines
function decodeBase64(data: string): Buffer {
    const base64 = data.replace(/^data:[\w/+.-]+;base64,/, "").replace(/\s/g, "");
    if (!/^[A-Za-z0-9+/_-]+={0,2}$/.test(base64)) {
        throw new BadRequestException("data is no valid Base64");
    }
    return Buffer.from(base64, "base64");
}
