import { BadRequestException, NotFoundException } from "@nestjs/common";
import { Epic } from "@src/epics/entities/epic.entity.js";
import type { EpicsService } from "@src/epics/epics.service.js";
import { Issue, IssuePriority, IssueStatus, IssueType } from "@src/issues/entities/issue.entity.js";
import { IssueView } from "@src/issues/issue-views.js";
import type { IssuesService } from "@src/issues/issues.service.js";
import { Project, ProjectStatus } from "@src/projects/entities/project.entity.js";
import type { ProjectsService } from "@src/projects/projects.service.js";
import { User } from "@src/users/user.entity.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { McpToolsService } from "./mcp-tools.service.js";

const user = new User();
const project = Object.assign(new Project(), {
    id: "8a3c5f1e-2b4d-4c6e-8f0a-1b2c3d4e5f60",
    key: "WEB",
    name: "Website Relaunch",
    status: ProjectStatus.active,
});
const designEpic = Object.assign(new Epic(), { id: "0b7f3a52-5c1e-4f0e-9d39-2f4a8e6b1c7d", name: "Design" });
const issue = Object.assign(new Issue(), {
    id: "5d2e8c1a-3f4b-4a6c-9e7d-8b1a2c3d4e5f",
    number: 12,
    title: "Navigation collapses too late",
    type: IssueType.bug,
    priority: IssuePriority.high,
    status: IssueStatus.todo,
    project: { id: project.id, loadOrFail: async () => project },
    links: { loadItems: async () => [{ id: "link-1", url: "https://example.com/old" }] },
});

describe("McpToolsService", () => {
    const projectsService = { findAllVisibleTo: vi.fn(), findOneVisibleTo: vi.fn() };
    const epicsService = { findAll: vi.fn(), findOneInProject: vi.fn() };
    const issuesService = {
        findAll: vi.fn(),
        findOneByKeyVisibleTo: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        addLink: vi.fn(),
        removeLink: vi.fn(),
    };
    const tools = new McpToolsService(
        projectsService as unknown as ProjectsService,
        epicsService as unknown as EpicsService,
        issuesService as unknown as IssuesService,
    );

    beforeEach(() => {
        vi.resetAllMocks();
        projectsService.findOneVisibleTo.mockImplementation(async (key: string) => (key === "WEB" ? project : null));
        issuesService.findOneByKeyVisibleTo.mockImplementation(async (key: string) => (key === "WEB-12" ? issue : null));
        epicsService.findAll.mockResolvedValue({ nodes: [designEpic], totalCount: 1 });
        issuesService.findAll.mockResolvedValue({ nodes: [issue], totalCount: 1 });
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
    });

    describe("listIssues", () => {
        it("lists the open issues of the project by default", async () => {
            await expect(tools.listIssues({ project: "web" }, user)).resolves.toBe(
                "Issues 1-1 of 1\nWEB-12 · bug · high · todo · Navigation collapses too late",
            );
            expect(issuesService.findAll.mock.calls[0][0]).toMatchObject({
                projectId: project.id,
                filter: { statuses: [IssueStatus.todo, IssueStatus.inProgress] },
            });
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
            issuesService.create.mockResolvedValue(Object.assign(new Issue(), { number: 57, title: "Try MCP" }));

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
                }),
                user,
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
            ).resolves.toBe("Updated WEB-12 · bug · high · done · Navigation collapses too late");
            expect(issuesService.update).toHaveBeenCalledWith(issue.id, expect.objectContaining({ status: IssueStatus.done, dueDate: null }), user);
            expect(issuesService.removeLink).toHaveBeenCalledWith("link-1", user);
            expect(issuesService.addLink).toHaveBeenCalledWith(expect.objectContaining({ issueId: issue.id, url: "https://example.com/new" }), user);
        });

        it.each([
            ["a link that is no URL", { addLinks: ["javascript:alert(1)"] }],
            ["a link the issue does not have", { removeLinks: ["https://example.com/missing"] }],
            ["a due date that is no day", { dueDate: "next week" }],
        ])("changes nothing for %s", async (_, changes) => {
            await expect(tools.updateIssue({ key: "WEB-12", status: IssueStatus.done, ...changes }, user)).rejects.toThrow(BadRequestException);
            expect(issuesService.update).not.toHaveBeenCalled();
        });
    });
});
