import type { EntityManager, Ref } from "@mikro-orm/postgresql";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Project } from "@src/projects/entities/project.entity.js";
import type { ProjectsService } from "@src/projects/projects.service.js";
import { User } from "@src/users/user.entity.js";
import { describe, expect, it, vi } from "vitest";

import { ProjectExportService } from "./project-export.service.js";

function createService({ project = null as Project | null, canManage = false } = {}) {
    const entityManager = { populate: vi.fn(), find: vi.fn().mockResolvedValue([]) };
    const projectsService = { findOneVisibleTo: vi.fn().mockResolvedValue(project), canManage: vi.fn().mockResolvedValue(canManage) };
    const service = new ProjectExportService(entityManager as unknown as EntityManager, projectsService as unknown as ProjectsService);
    return { service, entityManager };
}

describe("ProjectExportService.exportProject", () => {
    const user = Object.assign(new User(), { email: "max@example.com" });
    const project = Object.assign(new Project(), { key: "WEB", createdBy: { getEntity: () => user } as unknown as Ref<User> });

    it("exports a project to its owners and admins", async () => {
        const { service } = createService({ project, canManage: true });

        const projectExport = await service.exportProject("WEB", user);

        expect(projectExport.project).toMatchObject({ key: "WEB", createdBy: "max@example.com", members: [], epics: [] });
    });

    it("refuses projects the user does not see", async () => {
        const { service } = createService();
        await expect(service.exportProject("WEB", user)).rejects.toThrow(NotFoundException);
    });

    it("refuses members and viewers, like deleting the project", async () => {
        const { service, entityManager } = createService({ project });

        await expect(service.exportProject("WEB", user)).rejects.toThrow(ForbiddenException);
        expect(entityManager.find).not.toHaveBeenCalled();
    });
});
