import { EntityManager, UniqueConstraintViolationException } from "@mikro-orm/postgresql";
import { BadRequestException, Injectable } from "@nestjs/common";
import type { User } from "@src/users/user.entity.js";

import type { CreateProjectInput } from "./dto/create-project.input.js";
import { Project } from "./entities/project.entity.js";
import { ProjectMember, ProjectMemberRole } from "./entities/project-member.entity.js";

@Injectable()
export class ProjectsService {
    constructor(private readonly entityManager: EntityManager) {}

    async findAllVisibleTo(user: User): Promise<Project[]> {
        return this.entityManager.find(Project, user.isAdmin ? {} : { members: { user } }, { orderBy: { name: "asc" } });
    }

    async create(input: CreateProjectInput, user: User): Promise<Project> {
        const project = this.entityManager.create(Project, { ...input, createdBy: user });
        this.entityManager.create(ProjectMember, { project, user, role: ProjectMemberRole.owner });

        try {
            await this.entityManager.flush();
        } catch (error) {
            if (error instanceof UniqueConstraintViolationException) {
                throw new BadRequestException(`The key ${input.key} is already taken by another project`);
            }
            throw error;
        }
        return project;
    }
}
