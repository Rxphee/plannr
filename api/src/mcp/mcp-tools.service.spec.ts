import type { EntityManager } from "@mikro-orm/postgresql";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { SortDirection } from "@src/common/sort.js";
import { Epic } from "@src/epics/entities/epic.entity.js";
import { EpicSortField } from "@src/epics/epic-sort.js";
import type { EpicsService } from "@src/epics/epics.service.js";
import type { ImagesService } from "@src/images/images.service.js";
import { InstanceRolesService } from "@src/instance-roles/instance-roles.service.js";
import { Issue, IssuePriority, IssueStatus, IssueType } from "@src/issues/entities/issue.entity.js";
import { IssueSortField } from "@src/issues/issue-sort.js";
import { IssueView } from "@src/issues/issue-views.js";
import { IssuesService } from "@src/issues/issues.service.js";
import { Label } from "@src/labels/entities/label.entity.js";
import type { LabelsService } from "@src/labels/labels.service.js";
import { Project, ProjectStatus } from "@src/projects/entities/project.entity.js";
import { ProjectSortField } from "@src/projects/project-sort.js";
import { ProjectsService } from "@src/projects/projects.service.js";
import type { StorageService } from "@src/storage/storage.service.js";
import { User } from "@src/users/user.entity.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { McpToolsService } from "./mcp-tools.service.js";

const user = new User();
const erika = Object.assign(new User(), { firstName: "Erika", lastName: "Mustermann", email: "erika@plannr.localhost" });
const lukas = Object.assign(new User(), { firstName: "Lukas", lastName: "Berger", email: "lukas@plannr.localhost" });
const project = Object.assign(new Project(), {
    id: "8a3c5f1e-2b4d-4c6e-8f0a-1b2c3d4e5f60",
    key: "WEB",
    name: "Website Relaunch",
    status: ProjectStatus.active,
});
const designEpic = Object.assign(new Epic(), { id: "0b7f3a52-5c1e-4f0e-9d39-2f4a8e6b1c7d", name: "Design" });
const frontendLabel = Object.assign(new Label(), { id: "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d", name: "frontend" });
const upstreamLabel = Object.assign(new Label(), { id: "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e", name: "upstream" });

// Stands in for a loaded collection of labels
function labelsOf(labels: Label[]) {
    return { loadItems: async () => labels, getItems: () => labels };
}

const issue = Object.assign(new Issue(), {
    id: "5d2e8c1a-3f4b-4a6c-9e7d-8b1a2c3d4e5f",
    number: 12,
    title: "Navigation collapses too late",
    type: IssueType.bug,
    priority: IssuePriority.high,
    status: IssueStatus.todo,
    project: { id: project.id, loadOrFail: async () => project },
    links: { loadItems: async () => [{ id: "link-1", url: "https://example.com/old" }] },
    labels: labelsOf([frontendLabel]),
});

describe("McpToolsService", () => {
    const projectsService = { findAllVisibleTo: vi.fn(), findOneVisibleTo: vi.fn(), findAssignableUsers: vi.fn() };
    const epicsService = { findAll: vi.fn(), findOneInProject: vi.fn(), create: vi.fn(), update: vi.fn() };
    const issuesService = {
        findAll: vi.fn(),
        findOneByKeyVisibleTo: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        addLink: vi.fn(),
        removeLink: vi.fn(),
    };
    const labelsService = { findAll: vi.fn() };
    const imagesService = { upload: vi.fn() };
    const tools = new McpToolsService(
        projectsService as unknown as ProjectsService,
        epicsService as unknown as EpicsService,
        issuesService as unknown as IssuesService,
        labelsService as unknown as LabelsService,
        imagesService as unknown as ImagesService,
        { isEnabled: true } as StorageService,
    );

    beforeEach(() => {
        vi.resetAllMocks();
        projectsService.findOneVisibleTo.mockImplementation(async (key: string) => (key === "WEB" ? project : null));
        issuesService.findOneByKeyVisibleTo.mockImplementation(async (key: string) => (key === "WEB-12" ? issue : null));
        epicsService.findAll.mockResolvedValue({ nodes: [designEpic], totalCount: 1 });
        issuesService.findAll.mockResolvedValue({ nodes: [issue], totalCount: 1 });
        labelsService.findAll.mockResolvedValue({ nodes: [frontendLabel, upstreamLabel], totalCount: 2 });
        projectsService.findAssignableUsers.mockResolvedValue([erika, lukas]);
        imagesService.upload.mockResolvedValue({ id: "0a98e070-7ed8-4bf8-92b3-cce9382336b2" });
    });

    describe("uploadImage", () => {
        const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

        it("uploads the decoded image and answers with its Markdown line", async () => {
            const answer = await tools.uploadImage({ project: "WEB", data: png.toString("base64"), name: "Login form" }, user);

            expect(answer).toBe("![Login form](/images/0a98e070-7ed8-4bf8-92b3-cce9382336b2)");
            expect(imagesService.upload).toHaveBeenCalledWith({ projectKey: "WEB", content: png }, user);
        });

        it("takes a data URL and Base64 broken into lines", async () => {
            const base64 = png.toString("base64");
            await tools.uploadImage({ project: "WEB", data: `data:image/png;base64,${base64.slice(0, 4)}\n${base64.slice(4)}` }, user);

            expect(imagesService.upload).toHaveBeenCalledWith({ projectKey: "WEB", content: png }, user);
        });

        it("keeps the Markdown line intact when the alt text has brackets or line breaks", async () => {
            const answer = await tools.uploadImage({ project: "WEB", data: png.toString("base64"), name: "Step [2]\nof 3" }, user);

            expect(answer).toBe("![Step  2  of 3](/images/0a98e070-7ed8-4bf8-92b3-cce9382336b2)");
        });

        it.each(["", "not base64!", "data:image/png;base64,"])("refuses %j as no valid Base64", async (data) => {
            await expect(tools.uploadImage({ project: "WEB", data }, user)).rejects.toThrow(BadRequestException);
            expect(imagesService.upload).not.toHaveBeenCalled();
        });
    });

    describe("listProjects", () => {
        it("lists the active and paused projects by default", async () => {
            projectsService.findAllVisibleTo.mockResolvedValue({ nodes: [project], totalCount: 1 });

            await expect(tools.listProjects({}, user)).resolves.toBe("Projects 1-1 of 1\nWEB · active · Website Relaunch");
            expect(projectsService.findAllVisibleTo).toHaveBeenCalledWith(
                expect.objectContaining({ statuses: [ProjectStatus.active, ProjectStatus.paused], offset: 0, limit: 25 }),
                user,
            );
        });

        it("sorts by the field in its default direction unless one is given", async () => {
            projectsService.findAllVisibleTo.mockResolvedValue({ nodes: [project], totalCount: 1 });

            await tools.listProjects({ sort: ProjectSortField.createdAt }, user);
            await tools.listProjects({ sort: ProjectSortField.name, direction: SortDirection.desc }, user);
            expect(projectsService.findAllVisibleTo.mock.calls.map(([args]) => args.sort)).toEqual([
                { field: ProjectSortField.createdAt, direction: SortDirection.desc },
                { field: ProjectSortField.name, direction: SortDirection.desc },
            ]);
        });
    });

    describe("listEpics", () => {
        it("passes the sort to the epics", async () => {
            await tools.listEpics({ project: "WEB", sort: EpicSortField.name, direction: SortDirection.desc }, user);
            expect(epicsService.findAll.mock.calls[0][0]).toMatchObject({ sort: { field: EpicSortField.name, direction: SortDirection.desc } });
        });
    });

    describe("createEpic", () => {
        it("creates the epic in the project without a description unless given", async () => {
            epicsService.create.mockResolvedValue(Object.assign(new Epic(), { id: "4c1d", name: "Launch" }));

            await expect(tools.createEpic({ project: "web", name: " Launch " }, user)).resolves.toBe("Created Launch · 0/0 done · id 4c1d");
            expect(epicsService.create).toHaveBeenCalledWith(
                expect.objectContaining({ projectId: project.id, name: "Launch", description: "" }),
                user,
            );
        });

        it("checks the name with the rules of the GraphQL input", async () => {
            await expect(tools.createEpic({ project: "WEB", name: "  " }, user)).rejects.toThrow(BadRequestException);
            expect(epicsService.create).not.toHaveBeenCalled();
        });
    });

    describe("updateEpic", () => {
        const describedEpic = Object.assign(new Epic(), { ...designEpic, description: "Colors and fonts", issueCount: 4, doneIssueCount: 1 });

        beforeEach(() => {
            epicsService.findAll.mockResolvedValue({ nodes: [describedEpic], totalCount: 1 });
            epicsService.update.mockImplementation(async (_id: string, input: object) => Object.assign(new Epic(), describedEpic, input));
        });

        it("renames the epic found by name and keeps its description", async () => {
            await expect(tools.updateEpic({ project: "WEB", epic: "design", name: "Design System" }, user)).resolves.toBe(
                `Updated Design System · 1/4 done · id ${designEpic.id}`,
            );
            expect(epicsService.update).toHaveBeenCalledWith(
                designEpic.id,
                expect.objectContaining({ name: "Design System", description: "Colors and fonts" }),
                user,
            );
        });

        it("replaces the description and keeps the name", async () => {
            epicsService.findOneInProject.mockResolvedValue(describedEpic);

            await tools.updateEpic({ project: "WEB", epic: designEpic.id, description: "Only the colors" }, user);
            expect(epicsService.findOneInProject).toHaveBeenCalledWith(designEpic.id, project);
            expect(epicsService.update).toHaveBeenCalledWith(
                designEpic.id,
                expect.objectContaining({ name: "Design", description: "Only the colors" }),
                user,
            );
        });

        it("changes nothing for an epic the project does not have", async () => {
            await expect(tools.updateEpic({ project: "WEB", epic: "Marketing", name: "Ads" }, user)).rejects.toThrow(
                'The project WEB has no epic "Marketing"',
            );
            expect(epicsService.update).not.toHaveBeenCalled();
        });
    });

    describe("listIssues", () => {
        it("lists the open issues of the project by default", async () => {
            await expect(tools.listIssues({ project: "web" }, user)).resolves.toBe(
                "Issues 1-1 of 1\nWEB-12 · bug · high · todo · Navigation collapses too late · #frontend",
            );
            expect(issuesService.findAll.mock.calls[0][0]).toMatchObject({
                projectId: project.id,
                filter: { statuses: [IssueStatus.todo, IssueStatus.inProgress] },
            });
        });

        it("sorts the priority high first by default", async () => {
            await tools.listIssues({ project: "WEB", sort: IssueSortField.priority }, user);
            expect(issuesService.findAll.mock.calls[0][0]).toMatchObject({ sort: { field: IssueSortField.priority, direction: SortDirection.desc } });
        });

        it("refuses a direction without a sort field", async () => {
            await expect(tools.listIssues({ project: "WEB", direction: SortDirection.asc }, user)).rejects.toThrow("A direction needs a sort field");
            expect(issuesService.findAll).not.toHaveBeenCalled();
        });

        it("finds the epic by its name in any case", async () => {
            await tools.listIssues({ project: "WEB", epic: "design" }, user);
            expect(issuesService.findAll.mock.calls[0][0]).toMatchObject({ filter: { epicIds: [designEpic.id] } });
        });

        it("asks for the ID if several epics have the name", async () => {
            epicsService.findAll.mockResolvedValue({ nodes: [designEpic, { ...designEpic, id: "other" }], totalCount: 2 });
            await expect(tools.listIssues({ project: "WEB", epic: "Design" }, user)).rejects.toThrow(/pass the ID/);
        });

        it("leaves the statuses to a view, which shows open issues anyway", async () => {
            await tools.listIssues({ project: "WEB", view: IssueView.bugs }, user);
            const [args] = issuesService.findAll.mock.calls[0];
            expect(args).toMatchObject({ view: IssueView.bugs });
            expect(args.filter.statuses).toBeUndefined();
        });

        it("lists the issues of all projects without a project, each line with its key", async () => {
            const appProject = Object.assign(new Project(), { id: "9b4d6e2f-3c5e-4d7f-9a1b-2c3d4e5f6a70", key: "APP" });
            const appIssue = Object.assign(new Issue(), issue, { number: 3, project: { id: appProject.id, loadOrFail: async () => appProject } });
            issuesService.findAll.mockResolvedValue({ nodes: [appIssue, issue], totalCount: 2 });

            const answer = await tools.listIssues({ view: IssueView.focus }, user);
            expect(issuesService.findAll.mock.calls[0][0].projectId).toBeUndefined();
            expect(answer.split("\n").map((line) => line.split(" · ")[0])).toEqual(["Issues 1-2 of 2", "APP-3", "WEB-12"]);
        });

        it("finds the labels by name, in any case and with or without #", async () => {
            await tools.listIssues({ project: "WEB", labels: ["#Upstream", "frontend"] }, user);
            expect(issuesService.findAll.mock.calls[0][0]).toMatchObject({ filter: { labelIds: [upstreamLabel.id, frontendLabel.id] } });
        });

        it("names the existing labels for a wrong one", async () => {
            await expect(tools.listIssues({ project: "WEB", labels: ["backend"] }, user)).rejects.toThrow(
                'There is no label "backend". Labels: frontend, upstream',
            );
        });

        it("needs the project to find an epic", async () => {
            await expect(tools.listIssues({ epic: "Design" }, user)).rejects.toThrow(BadRequestException);
        });

        it("refuses a project the user cannot see", async () => {
            await expect(tools.listIssues({ project: "SEC" }, user)).rejects.toThrow(NotFoundException);
        });

        it("checks the arguments with the rules of the GraphQL input", async () => {
            await expect(tools.listIssues({ project: "WEB", limit: 101 }, user)).rejects.toThrow(BadRequestException);
            expect(issuesService.findAll).not.toHaveBeenCalled();
        });
    });

    describe("createIssue", () => {
        it("creates a task with normal priority in the epic General unless told otherwise", async () => {
            issuesService.create.mockResolvedValue(Object.assign(new Issue(), { number: 57, title: "Try MCP", labels: labelsOf([]) }));

            await expect(tools.createIssue({ project: "WEB", title: "  Try MCP " }, user)).resolves.toBe(
                "Created WEB-57 · task · normal · todo · Try MCP",
            );
            expect(issuesService.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    projectId: project.id,
                    epicId: undefined,
                    title: "Try MCP",
                    type: IssueType.task,
                    priority: IssuePriority.normal,
                    labelIds: [],
                }),
                user,
            );
        });

        it("adds the labels by name", async () => {
            issuesService.create.mockResolvedValue(Object.assign(new Issue(), { number: 57, title: "Try MCP", labels: labelsOf([upstreamLabel]) }));

            await expect(tools.createIssue({ project: "WEB", title: "Try MCP", labels: ["upstream"] }, user)).resolves.toBe(
                "Created WEB-57 · task · normal · todo · Try MCP · #upstream",
            );
            expect(issuesService.create).toHaveBeenCalledWith(expect.objectContaining({ labelIds: [upstreamLabel.id] }), user);
        });
    });

    describe("assignee", () => {
        it("assigns a new issue to the user with me", async () => {
            issuesService.create.mockResolvedValue(
                Object.assign(new Issue(), { number: 57, title: "Try MCP", labels: labelsOf([]), assignee: { getEntity: () => erika } }),
            );

            await expect(tools.createIssue({ project: "WEB", title: "Try MCP", assignee: "me" }, user)).resolves.toBe(
                "Created WEB-57 · task · normal · todo · Try MCP · @Erika Mustermann",
            );
            expect(issuesService.create).toHaveBeenCalledWith(expect.objectContaining({ assigneeId: user.id }), user);
        });

        it.each(["erika@plannr.localhost", "ERIKA MUSTERMANN"])("finds the assignee %s by email or full name in any case", async (assignee) => {
            issuesService.update.mockResolvedValue(issue);

            await tools.updateIssue({ key: "WEB-12", assignee }, user);
            expect(issuesService.update).toHaveBeenCalledWith(issue.id, expect.objectContaining({ assigneeId: erika.id }), user);
        });

        it("unassigns the issue with null", async () => {
            issuesService.update.mockResolvedValue(issue);

            await tools.updateIssue({ key: "WEB-12", assignee: null }, user);
            expect(issuesService.update).toHaveBeenCalledWith(issue.id, expect.objectContaining({ assigneeId: null }), user);
        });

        it("names the members for a wrong assignee and changes nothing", async () => {
            await expect(tools.updateIssue({ key: "WEB-12", status: IssueStatus.done, assignee: "Anna" }, user)).rejects.toThrow(
                'Issues of WEB cannot be assigned to "Anna". Members: Erika Mustermann <erika@plannr.localhost>, Lukas Berger <lukas@plannr.localhost>',
            );
            expect(issuesService.update).not.toHaveBeenCalled();
        });

        it("asks for the email if several members have the name", async () => {
            const otherErika = Object.assign(new User(), { firstName: "Erika", lastName: "Mustermann", email: "erika.m@plannr.localhost" });
            projectsService.findAssignableUsers.mockResolvedValue([erika, otherErika]);

            await expect(tools.updateIssue({ key: "WEB-12", assignee: "Erika Mustermann" }, user)).rejects.toThrow(
                'Several members are named "Erika Mustermann", pass the email instead',
            );
        });
    });

    describe("updateIssue", () => {
        it("changes the fields and links", async () => {
            issuesService.update.mockResolvedValue(Object.assign(new Issue(), issue, { status: IssueStatus.done }));

            await expect(
                tools.updateIssue(
                    {
                        key: "WEB-12",
                        status: IssueStatus.done,
                        dueDate: null,
                        addLinks: ["https://example.com/new"],
                        removeLinks: ["https://example.com/old"],
                    },
                    user,
                ),
            ).resolves.toBe("Updated WEB-12 · bug · high · done · Navigation collapses too late · #frontend");
            expect(issuesService.update).toHaveBeenCalledWith(issue.id, expect.objectContaining({ status: IssueStatus.done, dueDate: null }), user);
            expect(issuesService.removeLink).toHaveBeenCalledWith("link-1", user);
            expect(issuesService.addLink).toHaveBeenCalledWith(expect.objectContaining({ issueId: issue.id, url: "https://example.com/new" }), user);
        });

        it("applies added and removed labels to the labels of the issue", async () => {
            issuesService.update.mockResolvedValue(Object.assign(new Issue(), issue, { labels: labelsOf([upstreamLabel]) }));

            await tools.updateIssue({ key: "WEB-12", addLabels: ["upstream"], removeLabels: ["frontend"] }, user);
            expect(issuesService.update).toHaveBeenCalledWith(issue.id, expect.objectContaining({ labelIds: [upstreamLabel.id] }), user);
        });

        it("keeps the labels without label changes", async () => {
            issuesService.update.mockResolvedValue(issue);

            await tools.updateIssue({ key: "WEB-12", status: IssueStatus.done }, user);
            expect(issuesService.update.mock.calls[0][1].labelIds).toBeUndefined();
        });

        it.each([
            ["a label the issue does not have", { removeLabels: ["upstream"] }],
            ["a label that does not exist", { addLabels: ["backend"] }],
            ["a link that is no URL", { addLinks: ["javascript:alert(1)"] }],
            ["a link the issue does not have", { removeLinks: ["https://example.com/missing"] }],
            ["a due date that is no day", { dueDate: "next week" }],
        ])("changes nothing for %s", async (_, changes) => {
            await expect(tools.updateIssue({ key: "WEB-12", status: IssueStatus.done, ...changes }, user)).rejects.toThrow(BadRequestException);
            expect(issuesService.update).not.toHaveBeenCalled();
        });
    });
});

describe("McpToolsService with the real permission checks", () => {
    it("refuses to create an issue in an archived project, also for admins", async () => {
        const archivedProject = Object.assign(new Project(), {
            id: project.id,
            key: "HOL",
            name: "Holiday Planning",
            status: ProjectStatus.archived,
        });
        const entityManager = {
            findOne: vi.fn(async () => archivedProject),
            transactional: vi.fn(async (work: () => Promise<unknown>) => work()),
            create: vi.fn(),
        };
        const instanceRoles = new InstanceRolesService([]);
        const projectsService = new ProjectsService(entityManager as unknown as EntityManager, instanceRoles);
        const issuesService = new IssuesService(
            entityManager as unknown as EntityManager,
            projectsService,
            {} as EpicsService,
            {} as LabelsService,
            instanceRoles,
        );
        const tools = new McpToolsService(
            projectsService,
            {} as EpicsService,
            issuesService,
            {} as LabelsService,
            {} as ImagesService,
            { isEnabled: false } as StorageService,
        );

        await expect(tools.createIssue({ project: "HOL", title: "Book the train" }, Object.assign(new User(), { isAdmin: true }))).rejects.toThrow(
            "The project is archived. Set it back to active to change it",
        );
        expect(entityManager.create).not.toHaveBeenCalled();
    });
});
