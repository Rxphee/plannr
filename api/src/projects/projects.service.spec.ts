import type { EntityManager } from "@mikro-orm/postgresql";
import { ForbiddenException } from "@nestjs/common";
import { InstanceRolesService } from "@src/instance-roles/instance-roles.service.js";
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
