import type { EntityManager } from "@mikro-orm/postgresql";
import { InstanceRolesService } from "@src/instance-roles/instance-roles.service.js";
import { Project, ProjectStatus } from "@src/projects/entities/project.entity.js";
import { ProjectsService } from "@src/projects/projects.service.js";
import { User } from "@src/users/user.entity.js";
import { describe, expect, it, vi } from "vitest";

import { EpicsService } from "./epics.service.js";

describe("EpicsService.delete", () => {
    it("refuses to delete an epic of an archived project, also for admins", async () => {
        const project = Object.assign(new Project(), { key: "WEB", status: ProjectStatus.archived });
        const entityManager = {
            transactional: vi.fn(async (work: () => Promise<void>) => work()),
            findOne: vi.fn(async () => ({ isDefault: false, project: { loadOrFail: async () => project } })),
            nativeDelete: vi.fn(),
            remove: vi.fn(),
        };
        const instanceRoles = new InstanceRolesService([]);
        const service = new EpicsService(
            entityManager as unknown as EntityManager,
            new ProjectsService(entityManager as unknown as EntityManager, instanceRoles),
            instanceRoles,
        );

        await expect(service.delete("0b7f3a52-5c1e-4f0e-9d39-2f4a8e6b1c7d", null, Object.assign(new User(), { isAdmin: true }))).rejects.toThrow(
            "The project is archived. Set it back to active to change it",
        );
        expect(entityManager.nativeDelete).not.toHaveBeenCalled();
        expect(entityManager.remove).not.toHaveBeenCalled();
    });
});
