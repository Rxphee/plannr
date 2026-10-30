import type { EntityManager } from "@mikro-orm/postgresql";
import type { EpicsService } from "@src/epics/epics.service.js";
import type { LabelsService } from "@src/labels/labels.service.js";
import { Project, ProjectStatus } from "@src/projects/entities/project.entity.js";
import type { ProjectsService } from "@src/projects/projects.service.js";
import { User } from "@src/users/user.entity.js";
import { describe, expect, it, vi } from "vitest";

import type { IssuesArgs } from "./dto/issues.args.js";
import { IssuePriority, IssueStatus, IssueType } from "./entities/issue.entity.js";
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
