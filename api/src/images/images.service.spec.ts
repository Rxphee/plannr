import type { EntityManager } from "@mikro-orm/postgresql";
import { ForbiddenException, NotFoundException, PayloadTooLargeException, UnsupportedMediaTypeException } from "@nestjs/common";
import { InstanceRolesService } from "@src/instance-roles/instance-roles.service.js";
import { Project } from "@src/projects/entities/project.entity.js";
import type { ProjectsService } from "@src/projects/projects.service.js";
import type { StorageService } from "@src/storage/storage.service.js";
import { User } from "@src/users/user.entity.js";
import { describe, expect, it, vi } from "vitest";

import { Image } from "./entities/image.entity.js";
import { MAX_IMAGE_SIZE } from "./image-type.js";
import { ImagesService } from "./images.service.js";

const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);

function createService({
    isStorageEnabled = true,
    project = Object.assign(new Project(), { id: "project-id", key: "WEB" }) as Project | null,
    canContribute = true,
    storedImage = null as Image | null,
} = {}) {
    const entityManager = {
        create: vi.fn((_entity: unknown, data: object) => Object.assign(new Image(), data)),
        flush: vi.fn(),
        findOne: vi.fn().mockResolvedValue(storedImage),
    };
    const projectsService = {
        findOneVisibleTo: vi.fn().mockResolvedValue(project),
        assertCanContribute: vi.fn(async () => {
            if (!canContribute) {
                throw new ForbiddenException();
            }
        }),
    };
    const storage = { isEnabled: isStorageEnabled, putObject: vi.fn(), getObject: vi.fn().mockResolvedValue(png) };
    const service = new ImagesService(
        entityManager as unknown as EntityManager,
        projectsService as unknown as ProjectsService,
        new InstanceRolesService([]),
        storage as unknown as StorageService,
    );
    return { service, entityManager, storage };
}

describe("ImagesService.upload", () => {
    const user = new User();

    it("stores the image under its ID with the type detected from its content", async () => {
        const { service, entityManager, storage } = createService();

        const image = await service.upload({ projectKey: "WEB", content: png }, user);

        expect(image).toMatchObject({ contentType: "image/png", size: png.byteLength, uploadedBy: user });
        expect(entityManager.flush).toHaveBeenCalledBefore(storage.putObject);
        expect(storage.putObject).toHaveBeenCalledWith({ key: `images/${image.id}`, body: png, contentType: "image/png" });
    });

    it("refuses uploads without a storage", async () => {
        const { service } = createService({ isStorageEnabled: false });
        await expect(service.upload({ projectKey: "WEB", content: png }, user)).rejects.toThrow(NotFoundException);
    });

    it("refuses uploads to a project the user does not see", async () => {
        const { service } = createService({ project: null });
        await expect(service.upload({ projectKey: "WEB", content: png }, user)).rejects.toThrow(NotFoundException);
    });

    it("refuses uploads of users who cannot edit the project, e.g. viewers", async () => {
        const { service, storage } = createService({ canContribute: false });
        await expect(service.upload({ projectKey: "WEB", content: png }, user)).rejects.toThrow(ForbiddenException);
        expect(storage.putObject).not.toHaveBeenCalled();
    });

    it("refuses files that are no supported image", async () => {
        const { service } = createService();
        const svg = new TextEncoder().encode("<svg></svg>");
        await expect(service.upload({ projectKey: "WEB", content: svg }, user)).rejects.toThrow(UnsupportedMediaTypeException);
    });

    it("refuses images larger than the limit", async () => {
        const { service } = createService();
        const content = new Uint8Array(MAX_IMAGE_SIZE + 1);
        content.set(png);
        await expect(service.upload({ projectKey: "WEB", content }, user)).rejects.toThrow(PayloadTooLargeException);
    });
});

describe("ImagesService.findContent", () => {
    const id = "0b7f3a52-5c1e-4f0e-9d39-2f4a8e6b1c7d";

    it("finds the image only in a project the user is a member of", async () => {
        const storedImage = Object.assign(new Image(), { id, contentType: "image/png" });
        const { service, entityManager, storage } = createService({ storedImage });
        const user = new User();

        expect(await service.findContent(id, user)).toEqual({ image: storedImage, content: png });
        expect(entityManager.findOne).toHaveBeenCalledWith(Image, { id, project: { members: { user } } });
        expect(storage.getObject).toHaveBeenCalledWith(`images/${id}`);
    });

    it("lets admins see the images of every project, but not those of deleted projects", async () => {
        const { service, entityManager } = createService({ storedImage: new Image() });

        await service.findContent(id, Object.assign(new User(), { isAdmin: true }));

        expect(entityManager.findOne).toHaveBeenCalledWith(Image, { id, project: { $ne: null } });
    });

    it("answers a missing image like one the user does not see", async () => {
        const { service, storage } = createService({ storedImage: null });
        await expect(service.findContent(id, new User())).rejects.toThrow(NotFoundException);
        expect(storage.getObject).not.toHaveBeenCalled();
    });
});
