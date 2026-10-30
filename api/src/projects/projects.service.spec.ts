import type { EntityManager } from "@mikro-orm/postgresql";
import { ForbiddenException } from "@nestjs/common";
import { User } from "@src/users/user.entity.js";
import { describe, expect, it, vi } from "vitest";

import { Project, ProjectStatus } from "./entities/project.entity.js";
import { ProjectMember, ProjectMemberRole } from "./entities/project-member.entity.js";
import { ProjectsService } from "./projects.service.js";

function createService(role?: ProjectMemberRole) {
    const membership = role && Object.assign(new ProjectMember(), { role });
    const entityManager = { findOne: vi.fn(async () => membership ?? null) };
    return new ProjectsService(entityManager as unknown as EntityManager);
}

function createProject(status: ProjectStatus): Project {
    return Object.assign(new Project(), { name: "Website", key: "WEB", status });
}

const user = Object.assign(new User(), { isAdmin: false });
const admin = Object.assign(new User(), { isAdmin: true });

describe("ProjectsService.canContribute", () => {
    it.each([ProjectStatus.active, ProjectStatus.paused])(
        "lets owners, members and admins change the epics and issues of a %s project",
        async (status) => {
            const project = createProject(status);

            await expect(createService(ProjectMemberRole.owner).canContribute(project, user)).resolves.toBe(true);
            await expect(createService(ProjectMemberRole.member).canContribute(project, user)).resolves.toBe(true);
            await expect(createService().canContribute(project, admin)).resolves.toBe(true);
            await expect(createService(ProjectMemberRole.viewer).canContribute(project, user)).resolves.toBe(false);
        },
    );

    it("keeps an archived project read-only for everyone", async () => {
        const project = createProject(ProjectStatus.archived);

        await expect(createService(ProjectMemberRole.owner).canContribute(project, user)).resolves.toBe(false);
        await expect(createService(ProjectMemberRole.member).canContribute(project, user)).resolves.toBe(false);
        await expect(createService().canContribute(project, admin)).resolves.toBe(false);
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
