import { Injectable } from "@nestjs/common";
import type { CreateProjectInput } from "@src/projects/dto/create-project.input.js";
import { type Project, ProjectStatus } from "@src/projects/entities/project.entity.js";
import { ProjectMemberRole } from "@src/projects/entities/project-member.entity.js";
import { ProjectsService } from "@src/projects/projects.service.js";
import type { User } from "@src/users/user.entity.js";

import type { FixtureUsers } from "./users-fixture.service.js";

export interface FixtureProjects {
    website: Project;
    app: Project;
    // Archived, to check that deleting a project takes its epics and issues along
    holiday: Project;
}

@Injectable()
export class ProjectsFixtureService {
    constructor(private readonly projectsService: ProjectsService) {}

    async generateProjects({ developmentUser, otherUser, team }: FixtureUsers): Promise<FixtureProjects> {
        const website = await this.createProject(developmentUser, {
            name: "Website Relaunch",
            key: "WEB",
            description: "New design and content for the company website.",
        });
        await this.addMembers(website, developmentUser, [
            [otherUser, ProjectMemberRole.member],
            [team[0], ProjectMemberRole.owner],
            ...team.slice(1, 9).map((user): [User, ProjectMemberRole] => [user, ProjectMemberRole.member]),
            ...team.slice(9).map((user): [User, ProjectMemberRole] => [user, ProjectMemberRole.viewer]),
        ]);

        const app = await this.createProject(developmentUser, {
            name: "Mobile App",
            key: "APP",
            description: "Companion app for iOS and Android with offline support.",
        });
        await this.addMembers(app, developmentUser, [
            [team[2], ProjectMemberRole.member],
            [team[5], ProjectMemberRole.member],
            [team[7], ProjectMemberRole.viewer],
        ]);

        const move = await this.createProject(developmentUser, { name: "Office Move", key: "MOVE", description: "" }, ProjectStatus.paused);
        await this.addMembers(move, developmentUser, [[team[3], ProjectMemberRole.member]]);

        const holiday = await this.createProject(developmentUser, { name: "Holiday Planning", key: "HOL", description: "" }, ProjectStatus.archived);
        await this.createProject(otherUser, { name: "Secret Project", key: "SEC", description: "Only visible to its members and admins." });

        return { website, app, holiday };
    }

    private async addMembers(project: Project, owner: User, members: [User, ProjectMemberRole][]): Promise<void> {
        for (const [user, role] of members) {
            await this.projectsService.addMembers({ projectId: project.id, userIds: [user.id], role }, owner);
        }
    }

    private async createProject(user: User, input: CreateProjectInput, status: ProjectStatus = ProjectStatus.active): Promise<Project> {
        const project = await this.projectsService.create(input, user);
        return this.projectsService.changeStatus(project.id, status, user);
    }
}
