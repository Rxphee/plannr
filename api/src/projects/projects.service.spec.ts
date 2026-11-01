import type { EntityManager } from "@mikro-orm/postgresql";
import { ForbiddenException } from "@nestjs/common";
import { UserError } from "@src/common/user-error.js";
import { InstanceRolesService } from "@src/instance-roles/instance-roles.service.js";
import { Issue } from "@src/issues/entities/issue.entity.js";
import { User } from "@src/users/user.entity.js";
import { describe, expect, it, vi } from "vitest";

import { Project, ProjectStatus } from "./entities/project.entity.js";
import { ProjectMember, ProjectMemberRole } from "./entities/project-member.entity.js";
import { ProjectsService } from "./projects.service.js";

const instanceRoles = new InstanceRolesService(["ada@plannr.localhost"]);

function createService(role?: ProjectMemberRole) {
    const membership = role && Object.assign(new ProjectMember(), { role });
    const entityManager = { findOne: vi.fn(async () => membership ?? null) };
    return new ProjectsService(entityManager as unknown as EntityManager, instanceRoles);
}

function createProject(status: ProjectStatus): Project {
    return Object.assign(new Project(), { name: "Website", key: "WEB", status });
}

const user = Object.assign(new User(), { email: "max@plannr.localhost", isEmailVerified: true, isAdmin: false });
const admin = Object.assign(new User(), { email: "erika@plannr.localhost", isEmailVerified: true, isAdmin: true });
// Through SUPER_ADMIN_EMAILS, without the admin flag
const superAdmin = Object.assign(new User(), { email: "ada@plannr.localhost", isEmailVerified: true, isAdmin: false });

describe("ProjectsService.canContribute", () => {
    it.each([ProjectStatus.active, ProjectStatus.paused])(
        "lets owners, members and admins change the epics and issues of a %s project",
        async (status) => {
            const project = createProject(status);

            await expect(createService(ProjectMemberRole.owner).canContribute(project, user)).resolves.toBe(true);
            await expect(createService(ProjectMemberRole.member).canContribute(project, user)).resolves.toBe(true);
            await expect(createService().canContribute(project, admin)).resolves.toBe(true);
            await expect(createService().canContribute(project, superAdmin)).resolves.toBe(true);
            await expect(createService(ProjectMemberRole.viewer).canContribute(project, user)).resolves.toBe(false);
        },
    );

    it("keeps an archived project read-only for everyone", async () => {
        const project = createProject(ProjectStatus.archived);

        await expect(createService(ProjectMemberRole.owner).canContribute(project, user)).resolves.toBe(false);
        await expect(createService(ProjectMemberRole.member).canContribute(project, user)).resolves.toBe(false);
        await expect(createService().canContribute(project, admin)).resolves.toBe(false);
        await expect(createService().canContribute(project, superAdmin)).resolves.toBe(false);
    });
});

describe("ProjectsService.canManage", () => {
    it("lets owners, admins and the super-admin manage a project", async () => {
        const project = createProject(ProjectStatus.active);

        await expect(createService(ProjectMemberRole.owner).canManage(project, user)).resolves.toBe(true);
        await expect(createService().canManage(project, admin)).resolves.toBe(true);
        await expect(createService().canManage(project, superAdmin)).resolves.toBe(true);
        await expect(createService(ProjectMemberRole.member).canManage(project, user)).resolves.toBe(false);
    });

    it("does not count an unverified super-admin email address", async () => {
        const unverified = Object.assign(new User(), { email: "ada@plannr.localhost", isEmailVerified: false, isAdmin: false });
        await expect(createService().canManage(createProject(ProjectStatus.active), unverified)).resolves.toBe(false);
    });
});

describe("ProjectsService.findAllVisibleTo", () => {
    // The condition the service passes to the database
    async function findAllWhere(viewer: User) {
        const findAndCount = vi.fn().mockResolvedValue([[], 0]);
        await new ProjectsService({ findAndCount } as unknown as EntityManager, instanceRoles).findAllVisibleTo({ offset: 0, limit: 25 }, viewer);
        return findAndCount.mock.calls[0]?.[1];
    }

    it("shows admins and the super-admin all projects", async () => {
        await expect(findAllWhere(admin)).resolves.toEqual({});
        await expect(findAllWhere(superAdmin)).resolves.toEqual({});
    });

    it("shows other users only their projects", async () => {
        await expect(findAllWhere(user)).resolves.toEqual({ members: { user } });
    });
});

describe("ProjectsService.findAdminsWithoutMembership", () => {
    it("leaves out the admins who are a member of the project", async () => {
        const memberAdmin = Object.assign(new User(), { firstName: "Lukas", lastName: "Berger", isAdmin: true });
        const membership = Object.assign(new ProjectMember(), { user: memberAdmin });
        const find = vi.fn().mockResolvedValueOnce([admin, memberAdmin, superAdmin]).mockResolvedValueOnce([membership]);
        const service = new ProjectsService({ find } as unknown as EntityManager, instanceRoles);

        await expect(service.findAdminsWithoutMembership(createProject(ProjectStatus.active))).resolves.toEqual([admin, superAdmin]);
    });
});

describe("ProjectsService.assertCanContribute", () => {
    it("allows changes to a paused project", async () => {
        await expect(createService(ProjectMemberRole.member).assertCanContribute(createProject(ProjectStatus.paused), user)).resolves.toBeUndefined();
    });

    it("refuses changes to an archived project and tells how to change it again", async () => {
        const change = createService().assertCanContribute(createProject(ProjectStatus.archived), admin);

        await expect(change).rejects.toThrow(ForbiddenException);
        await expect(change).rejects.toThrow("The project is archived. Set it back to active to change it");
    });

    it("refuses changes by viewers", async () => {
        await expect(createService(ProjectMemberRole.viewer).assertCanContribute(createProject(ProjectStatus.active), user)).rejects.toThrow(
            "Viewers can only read the epics and issues of the project",
        );
    });
});

describe("ProjectsService.prepareAssignee", () => {
    const project = createProject(ProjectStatus.active);

    it("takes a member of the project", async () => {
        const membership = Object.assign(new ProjectMember(), { user: { getEntity: () => user } });
        const entityManager = { findOne: vi.fn().mockResolvedValueOnce(membership), create: vi.fn() };
        const service = new ProjectsService(entityManager as unknown as EntityManager, instanceRoles);

        await expect(service.prepareAssignee(project, user.id)).resolves.toBe(user);
        expect(entityManager.create).not.toHaveBeenCalled();
    });

    it.each([
        ["an admin", admin],
        ["the super-admin", superAdmin],
    ])("makes %s without membership a member", async (_, adminUser) => {
        const entityManager = { findOne: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(adminUser), create: vi.fn() };
        const service = new ProjectsService(entityManager as unknown as EntityManager, instanceRoles);

        await expect(service.prepareAssignee(project, adminUser.id)).resolves.toBe(adminUser);
        expect(entityManager.create).toHaveBeenCalledWith(ProjectMember, { project, user: adminUser, role: ProjectMemberRole.member });
    });

    it.each([
        ["a user outside the project", user],
        ["a user that does not exist", null],
    ])("refuses %s", async (_, outsider) => {
        const entityManager = { findOne: vi.fn().mockResolvedValueOnce(null).mockResolvedValueOnce(outsider), create: vi.fn() };
        const service = new ProjectsService(entityManager as unknown as EntityManager, instanceRoles);

        const assignment = service.prepareAssignee(project, user.id);
        await expect(assignment).rejects.toThrow(UserError);
        await expect(assignment).rejects.toMatchObject({ reason: "assigneeNotAMember" });
        expect(entityManager.create).not.toHaveBeenCalled();
    });
});

describe("ProjectsService.removeMember", () => {
    it("unassigns the issues of the former member in the project", async () => {
        const project = createProject(ProjectStatus.active);
        const membership = Object.assign(new ProjectMember(), { role: ProjectMemberRole.member });
        const entityManager = {
            transactional: vi.fn(async (work: () => Promise<unknown>) => work()),
            findOne: vi.fn().mockResolvedValueOnce(project).mockResolvedValueOnce(membership),
            lock: vi.fn(),
            remove: vi.fn(),
            nativeUpdate: vi.fn(),
        };
        const service = new ProjectsService(entityManager as unknown as EntityManager, instanceRoles);

        await service.removeMember(project.id, user.id, admin);

        expect(entityManager.remove).toHaveBeenCalledWith(membership);
        expect(entityManager.nativeUpdate).toHaveBeenCalledWith(Issue, { project, assignee: user.id }, { assignee: null });
    });
});
