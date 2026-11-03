import { EntityManager } from "@mikro-orm/postgresql";
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Epic } from "@src/epics/entities/epic.entity.js";
import { epicOrder } from "@src/epics/epic-sort.js";
import { Issue } from "@src/issues/entities/issue.entity.js";
import { ProjectMember } from "@src/projects/entities/project-member.entity.js";
import { ProjectsService } from "@src/projects/projects.service.js";
import type { User } from "@src/users/user.entity.js";

import { buildProjectExport, type ProjectExport } from "./project-export-format.js";

@Injectable()
export class ProjectExportService {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly projectsService: ProjectsService,
    ) {}

    // The whole project in one piece, a backup that does not need a database dump. Only for owners and admins, like deleting it.
    async exportProject(key: string, user: User): Promise<ProjectExport> {
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
        return buildProjectExport({ project, members, epics, issues, exportedAt: new Date() });
    }
}
