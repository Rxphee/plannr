import { Injectable } from "@nestjs/common";
import type { CreateProjectInput } from "@src/projects/dto/create-project.input.js";
import { type Project, ProjectStatus } from "@src/projects/entities/project.entity.js";
import { ProjectMemberRole } from "@src/projects/entities/project-member.entity.js";
import { ProjectsService } from "@src/projects/projects.service.js";
import type { User } from "@src/users/user.entity.js";

import type { FixtureUsers } from "./users-fixture.service.js";

@Injectable()
export class ProjectsFixtureService {
    constructor(private readonly projectsService: ProjectsService) {}

    async generateProjects({ developmentUser, otherUser }: FixtureUsers): Promise<void> {
        const website = await this.createProject(developmentUser, {
            name: "Website Relaunch",
            key: "WEB",
            description: "New design and content for the company website.",
        });
        await this.projectsService.addMember({ projectId: website.id, userId: otherUser.id, role: ProjectMemberRole.member }, developmentUser);

        await this.createProject(developmentUser, { name: "Mobile App", key: "APP", description: "" });
        await this.createProject(developmentUser, { name: "Office Move", key: "MOVE", description: "" }, ProjectStatus.paused);
        await this.createProject(developmentUser, { name: "Holiday Planning", key: "HOL", description: "" }, ProjectStatus.archived);
        await this.createProject(otherUser, { name: "Secret Project", key: "SEC", description: "Only visible to its members and admins." });
    }

    private async createProject(user: User, input: CreateProjectInput, status: ProjectStatus = ProjectStatus.active): Promise<Project> {
        const project = await this.projectsService.create(input, user);
        return this.projectsService.changeStatus(project.id, status, user);
    }
}
