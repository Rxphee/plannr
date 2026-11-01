import { type EntityManager, ref } from "@mikro-orm/postgresql";
import type { EpicsService } from "@src/epics/epics.service.js";
import { InstanceRolesService } from "@src/instance-roles/instance-roles.service.js";
import type { LabelsService } from "@src/labels/labels.service.js";
import { Project, ProjectStatus } from "@src/projects/entities/project.entity.js";
import { ProjectsService } from "@src/projects/projects.service.js";
import { User } from "@src/users/user.entity.js";
import { describe, expect, it, vi } from "vitest";

import type { IssuesArgs } from "./dto/issues.args.js";
import { Issue, IssuePriority, IssueStatus, IssueType } from "./entities/issue.entity.js";
import { IssueLinkKind } from "./entities/issue-link.entity.js";
import { IssueView } from "./issue-views.js";
import { IssuesService } from "./issues.service.js";

const openStatuses = { status: { $in: [IssueStatus.todo, IssueStatus.inProgress] } };

// The conditions and the order the service passes to the database, which the specs do not need
async function findAll(args: Partial<IssuesArgs>, { isAdmin = false } = {}) {
    const project = Object.assign(new Project(), { key: "WEB" });
    const user = Object.assign(new User(), { isAdmin });
    const findAndCount = vi.fn().mockResolvedValue([[], 0]);
    const service = new IssuesService(
        { findAndCount } as unknown as EntityManager,
        { findOneVisibleById: vi.fn().mockResolvedValue(project) } as unknown as ProjectsService,
        {} as EpicsService,
        {} as LabelsService,
        new InstanceRolesService([]),
    );

    await service.findAll({ offset: 0, limit: 25, ...args }, user);
    const [, where, { orderBy }] = findAndCount.mock.calls[0];
    return { where, orderBy, project, user };
}

describe("IssuesService.findAll", () => {
    it("lists the issues of the project newest first", async () => {
        const { where, orderBy, project } = await findAll({ projectId: "0b7f3a52-5c1e-4f0e-9d39-2f4a8e6b1c7d" });

        expect(where).toEqual({ project });
        expect(orderBy).toEqual({ number: "desc" });
    });

    it.each([
        [IssueView.focus, { priority: IssuePriority.high }],
        [IssueView.due, { dueDate: { $ne: null } }],
        [IssueView.bugs, { type: IssueType.bug }],
        [IssueView.pullRequests, { links: { $some: { kind: IssueLinkKind.pullRequest } } }],
    ])("shows the open issues of the view %s on top of the filter", async (view, viewCondition) => {
        const { where, project } = await findAll({
            projectId: "0b7f3a52-5c1e-4f0e-9d39-2f4a8e6b1c7d",
            view,
            filter: { statuses: [IssueStatus.inProgress] },
        });

        expect(where).toEqual({
            $and: [{ project, status: { $in: [IssueStatus.inProgress] } }, { $and: [openStatuses, viewCondition] }],
        });
    });

    it("shows the open issues assigned to the user in the view assignedToMe", async () => {
        const { where, project, user } = await findAll({ projectId: "0b7f3a52-5c1e-4f0e-9d39-2f4a8e6b1c7d", view: IssueView.assignedToMe });

        expect(where).toEqual({ $and: [{ project }, { $and: [openStatuses, { assignee: user.id }] }] });
    });

    it("shows the issues with any of the labels on top of the view", async () => {
        const labelIds = ["9c4e2a71-3b5d-4f8e-a6c2-1d7b9e3f5a80", "6e2d9c41-8a3b-4b7f-a1e5-3c9d7f2b8e60"];
        const { where, project } = await findAll({ projectId: "0b7f3a52-5c1e-4f0e-9d39-2f4a8e6b1c7d", view: IssueView.bugs, filter: { labelIds } });

        expect(where).toEqual({
            $and: [{ project, labels: { $some: { id: { $in: labelIds } } } }, { $and: [openStatuses, { type: IssueType.bug }] }],
        });
    });

    it("sorts the due issues by their due date, then newest first", async () => {
        const { orderBy } = await findAll({ projectId: "0b7f3a52-5c1e-4f0e-9d39-2f4a8e6b1c7d", view: IssueView.due });

        expect(orderBy).toEqual({ dueDate: "asc", number: "desc" });
    });

    it("lists the issues of the active and paused projects of the user without a project", async () => {
        const { where, orderBy, user } = await findAll({});

        expect(where).toEqual({ project: { status: { $in: [ProjectStatus.active, ProjectStatus.paused] }, members: { user } } });
        expect(orderBy).toEqual({ createdAt: "desc", id: "desc" });
    });

    it("lists the issues of all active and paused projects for admins", async () => {
        const { where } = await findAll({}, { isAdmin: true });

        expect(where).toEqual({ project: { status: { $in: [ProjectStatus.active, ProjectStatus.paused] } } });
    });

    it.each([
        ["WEB-42", { number: 42, project: { key: "WEB" } }],
        ["web-42", { number: 42, project: { key: "WEB" } }],
        ["42", { number: 42 }],
    ])("finds the issue by the key in the search %j", async (search, keyCondition) => {
        const { where } = await findAll({ filter: { search } });

        expect(where.$or).toEqual([{ title: { $ilike: `%${search}%` } }, keyCondition]);
    });

    it("searches only the title for other text", async () => {
        const { where } = await findAll({ filter: { search: "header" } });

        expect(where.$or).toEqual([{ title: { $ilike: "%header%" } }]);
    });
});

describe("IssuesService.delete", () => {
    it("refuses to delete an issue of an archived project, also for admins", async () => {
        const project = Object.assign(new Project(), { key: "WEB", status: ProjectStatus.archived });
        const entityManager = { findOne: vi.fn(async () => ({ project: { loadOrFail: async () => project } })), remove: vi.fn() };
        const service = new IssuesService(
            entityManager as unknown as EntityManager,
            new ProjectsService(entityManager as unknown as EntityManager, new InstanceRolesService([])),
            {} as EpicsService,
            {} as LabelsService,
            new InstanceRolesService([]),
        );

        await expect(service.delete("0b7f3a52-5c1e-4f0e-9d39-2f4a8e6b1c7d", Object.assign(new User(), { isAdmin: true }))).rejects.toThrow(
            "The project is archived. Set it back to active to change it",
        );
        expect(entityManager.remove).not.toHaveBeenCalled();
    });
});

describe("IssuesService.update", () => {
    const project = Object.assign(new Project(), { key: "WEB", status: ProjectStatus.active });
    const max = Object.assign(new User(), { firstName: "Max" });
    const erika = Object.assign(new User(), { firstName: "Erika" });

    function createService(issue: Issue) {
        const projectsService = { assertCanContribute: vi.fn(), prepareAssignee: vi.fn(async () => erika) };
        const entityManager = { findOne: vi.fn(async () => issue), assign: vi.fn(), flush: vi.fn() };
        const service = new IssuesService(
            entityManager as unknown as EntityManager,
            projectsService as unknown as ProjectsService,
            {} as EpicsService,
            {} as LabelsService,
            new InstanceRolesService([]),
        );
        return { service, projectsService };
    }

    function createIssue(): Issue {
        return Object.assign(new Issue(), { project: { loadOrFail: async () => project }, assignee: ref(max) });
    }

    it("assigns the issue to a member, through the rules of the project", async () => {
        const issue = createIssue();
        const { service, projectsService } = createService(issue);

        await service.update(issue.id, { assigneeId: erika.id }, max);

        expect(projectsService.prepareAssignee).toHaveBeenCalledWith(project, erika.id);
        expect(issue.assignee?.unwrap()).toBe(erika);
    });

    it("unassigns the issue with null and keeps the assignee without it", async () => {
        const unassignedIssue = createIssue();
        await createService(unassignedIssue).service.update(unassignedIssue.id, { assigneeId: null }, max);
        expect(unassignedIssue.assignee).toBeNull();

        const untouchedIssue = createIssue();
        await createService(untouchedIssue).service.update(untouchedIssue.id, { title: "New title" }, max);
        expect(untouchedIssue.assignee?.unwrap()).toBe(max);
    });
});
