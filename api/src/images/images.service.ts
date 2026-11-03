import { EntityManager, type FilterQuery } from "@mikro-orm/postgresql";
import { Injectable, NotFoundException, PayloadTooLargeException, UnsupportedMediaTypeException } from "@nestjs/common";
import { InstanceRolesService } from "@src/instance-roles/instance-roles.service.js";
import { ProjectsService } from "@src/projects/projects.service.js";
import { StorageService } from "@src/storage/storage.service.js";
import type { User } from "@src/users/user.entity.js";

import { Image } from "./entities/image.entity.js";
import { detectImageType, imageStorageKey, MAX_IMAGE_SIZE } from "./image-type.js";

@Injectable()
export class ImagesService {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly projectsService: ProjectsService,
        private readonly instanceRoles: InstanceRolesService,
        private readonly storage: StorageService,
    ) {}

    // Whoever may edit the epics and issues of a project may add images to their descriptions
    async upload({ projectKey, content }: { projectKey: string; content: Uint8Array }, user: User): Promise<Image> {
        this.assertStorageEnabled();
        const project = await this.projectsService.findOneVisibleTo(projectKey, user);
        if (!project) {
            throw new NotFoundException("The project does not exist");
        }
        await this.projectsService.assertCanContribute(project, user);
        if (content.byteLength > MAX_IMAGE_SIZE) {
            throw new PayloadTooLargeException(`An image may have at most ${MAX_IMAGE_SIZE / 1024 / 1024} MB`);
        }
        const contentType = detectImageType(content);
        if (!contentType) {
            throw new UnsupportedMediaTypeException("Only PNG, JPEG, GIF and WebP images can be uploaded");
        }

        const image = this.entityManager.create(Image, { project, uploadedBy: user, contentType, size: content.byteLength });
        // The row comes first, so the cleanup also finds an object whose upload broke off
        await this.entityManager.flush();
        await this.storage.putObject({ key: imageStorageKey(image.id), body: content, contentType });
        return image;
    }

    // Whoever sees the project sees its images. A missing image and one of a project the user does not see
    // get the same answer, so an ID reveals nothing.
    async findContent(id: string, user: User): Promise<{ image: Image; content: Uint8Array }> {
        this.assertStorageEnabled();
        const where: FilterQuery<Image> = this.instanceRoles.hasAdminRights(user)
            ? { id, project: { $ne: null } }
            : { id, project: { members: { user } } };
        const image = await this.entityManager.findOne(Image, where);
        if (!image) {
            throw new NotFoundException("The image does not exist");
        }
        return { image, content: await this.storage.getObject(imageStorageKey(image.id)) };
    }

    private assertStorageEnabled(): void {
        if (!this.storage.isEnabled) {
            throw new NotFoundException("This instance has no storage for images");
        }
    }
}
