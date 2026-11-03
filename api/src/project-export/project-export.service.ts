import { Readable } from "node:stream";

import { EntityManager } from "@mikro-orm/postgresql";
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Epic } from "@src/epics/entities/epic.entity.js";
import { epicOrder } from "@src/epics/epic-sort.js";
import type { Image } from "@src/images/entities/image.entity.js";
import { findImageIds } from "@src/images/image-type.js";
import { ImagesService } from "@src/images/images.service.js";
import { Issue } from "@src/issues/entities/issue.entity.js";
import { ProjectMember } from "@src/projects/entities/project-member.entity.js";
import { ProjectsService } from "@src/projects/projects.service.js";
import type { User } from "@src/users/user.entity.js";

import { buildProjectExport, imageFileName, type ProjectExport, projectExportFileName } from "./project-export-format.js";
import { zipEntries, type ZipEntry } from "./zip-entries.js";

const PROJECT_FILE_NAME = "project.json";

export interface ProjectArchive {
    fileName: string;
    content: Readable;
}

@Injectable()
export class ProjectExportService {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly projectsService: ProjectsService,
        private readonly imagesService: ImagesService,
    ) {}

    // A ZIP with project.json and the images its descriptions link to, a backup that does not need a database dump.
    // Rights and data are checked and loaded before the first byte, the images are read one by one while the archive is sent.
    async createArchive(key: string, user: User): Promise<ProjectArchive> {
        const { projectExport, images } = await this.exportProject(key, user);
        const readContent = (image: Image) => this.imagesService.readContent(image);
        async function* entries(): AsyncGenerator<ZipEntry> {
            yield { name: PROJECT_FILE_NAME, content: Buffer.from(JSON.stringify(projectExport, null, 4)), shouldCompress: true };
            for (const image of images) {
                yield { name: imageFileName(image), content: await readContent(image) };
            }
        }
        return { fileName: projectExportFileName(projectExport), content: Readable.from(zipEntries(entries())) };
    }

    // Only for owners and admins, like deleting the project
    async exportProject(key: string, user: User): Promise<{ projectExport: ProjectExport; images: Image[] }> {
        const project = await this.projectsService.findOneVisibleTo(key, user);
        if (!project) {
            throw new NotFoundException("The project does not exist");
        }
        if (!(await this.projectsService.canManage(project, user))) {
            throw new ForbiddenException("Only owners and admins can export the project");
        }

        await this.entityManager.populate(project, ["createdBy"]);
        const members = await this.entityManager.find(
            ProjectMember,
            { project },
            { populate: ["user"], orderBy: { user: { firstName: "asc", lastName: "asc", id: "asc" } } },
        );
        const epics = await this.entityManager.find(Epic, { project }, { orderBy: epicOrder() });
        const issues = await this.entityManager.find(
            Issue,
            { project },
            { populate: ["labels", "links", "assignee", "createdBy"], orderBy: { number: "asc" } },
        );
        // Also images of another project that were copied into a description here, as long as the user sees them
        const descriptions = [project, ...epics, ...issues].map(({ description }) => description);
        const images = await this.imagesService.findVisible(findImageIds(descriptions.join("\n")), user);

        const projectExport = buildProjectExport({ project, members, epics, issues, images, exportedAt: new Date() });
        return { projectExport, images };
    }
}
