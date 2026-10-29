import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import type { CreateProjectInput } from "@src/projects/dto/create-project.input.js";
import { ProjectStatus } from "@src/projects/entities/project.entity.js";
import { ProjectsService } from "@src/projects/projects.service.js";
import type { User } from "@src/users/user.entity.js";

import type { FixtureUsers } from "./users-fixture.service.js";

@Injectable()
export class ProjectsFixtureService {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly projectsService: ProjectsService,
    ) {}

    async generateProjects({ developmentUser, otherUser }: FixtureUsers): Promise<void> {
        await this.createProject(developmentUser, {
            name: "Website Relaunch",
            key: "WEB",
            description: "New design and content for the company website.",
        });
        await this.createProject(developmentUser, { name: "Mobile App", key: "APP", description: "" });
        await this.createProject(developmentUser, { name: "Office Move", key: "MOVE", description: "" }, ProjectStatus.paused);
        await this.createProject(developmentUser, { name: "Holiday Planning", key: "HOL", description: "" }, ProjectStatus.archived);
        await this.createProject(otherUser, { name: "Secret Project", key: "SEC", description: "Only visible to its members and admins." });
    }

    private async createProject(user: User, input: CreateProjectInput, status: ProjectStatus = ProjectStatus.active): Promise<void> {
        const project = await this.projectsService.create(input, user);

        if (status !== ProjectStatus.active) {
            project.status = status;
            project.archivedAt = status === ProjectStatus.archived ? new Date() : undefined;
            await this.entityManager.flush();
        }
    }
}
