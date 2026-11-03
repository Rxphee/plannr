import { buffer } from "node:stream/consumers";

import type { EntityManager, Ref } from "@mikro-orm/postgresql";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { Epic } from "@src/epics/entities/epic.entity.js";
import { Image } from "@src/images/entities/image.entity.js";
import type { ImagesService } from "@src/images/images.service.js";
import { Project } from "@src/projects/entities/project.entity.js";
import type { ProjectsService } from "@src/projects/projects.service.js";
import { User } from "@src/users/user.entity.js";
import { strFromU8, unzipSync } from "fflate";
import { describe, expect, it, vi } from "vitest";

import { ProjectExportService } from "./project-export.service.js";

const IMAGE_ID = "1c349463-21ff-4e83-9119-af96198d3bc7";
const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);

const user = Object.assign(new User(), { email: "max@example.com" });
const loadedUser = { getEntity: () => user } as unknown as Ref<User>;

function createService({ project = null as Project | null, canManage = false, epics = [] as Epic[], visibleImages = [] as Image[] } = {}) {
    const entityManager = {
        populate: vi.fn(),
        find: vi.fn(async (entity: unknown) => (entity === Epic ? epics : [])),
    };
    const projectsService = { findOneVisibleTo: vi.fn().mockResolvedValue(project), canManage: vi.fn().mockResolvedValue(canManage) };
    const imagesService = { findVisible: vi.fn().mockResolvedValue(visibleImages), readContent: vi.fn().mockResolvedValue(png) };
    const service = new ProjectExportService(
        entityManager as unknown as EntityManager,
        projectsService as unknown as ProjectsService,
        imagesService as unknown as ImagesService,
    );
    return { service, entityManager, imagesService };
}

describe("ProjectExportService.exportProject", () => {
    const project = Object.assign(new Project(), { key: "WEB", createdBy: loadedUser });

    it("exports a project to its owners and admins", async () => {
        const { service } = createService({ project, canManage: true });

        const { projectExport } = await service.exportProject("WEB", user);

        expect(projectExport.project).toMatchObject({ key: "WEB", createdBy: "max@example.com", members: [], epics: [] });
    });

    it("looks for the images the descriptions link to", async () => {
        const epic = Object.assign(new Epic(), { name: "Design", description: `![Logo](/images/${IMAGE_ID})` });
        const { service, imagesService } = createService({ project, canManage: true, epics: [epic] });

        await service.exportProject("WEB", user);

        expect(imagesService.findVisible).toHaveBeenCalledWith([IMAGE_ID], user);
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

describe("ProjectExportService.createArchive", () => {
    it("zips project.json with the image files it lists", async () => {
        const project = Object.assign(new Project(), { key: "WEB", createdBy: loadedUser, createdAt: new Date("2026-10-29T08:00:00Z") });
        const image = Object.assign(new Image(), { id: IMAGE_ID, contentType: "image/png" as const, size: png.byteLength, uploadedBy: loadedUser });
        const { service } = createService({ project, canManage: true, visibleImages: [image] });

        const { fileName, content } = await service.createArchive("WEB", user);
        const files = unzipSync(new Uint8Array(await buffer(content)));

        expect(fileName).toMatch(/^plannr-WEB-\d{4}-\d{2}-\d{2}\.zip$/);
        expect(Object.keys(files)).toEqual(["project.json", `images/${IMAGE_ID}.png`]);
        expect(JSON.parse(strFromU8(files["project.json"]))).toMatchObject({ images: [{ id: IMAGE_ID, file: `images/${IMAGE_ID}.png` }] });
        expect(files[`images/${IMAGE_ID}.png`]).toEqual(png);
    });
});
