import { Args, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "@src/auth/current-user.decorator.js";
import type { User } from "@src/users/user.entity.js";

import { CreateProjectInput } from "./dto/create-project.input.js";
import { Project } from "./entities/project.entity.js";
import { ProjectMember } from "./entities/project-member.entity.js";
import { ProjectsService } from "./projects.service.js";

@Resolver(() => Project)
export class ProjectsResolver {
    constructor(private readonly projectsService: ProjectsService) {}

    @Query(() => [Project], { description: "Projects visible to the current user, sorted by name" })
    async projects(@CurrentUser() user: User): Promise<Project[]> {
        return this.projectsService.findAllVisibleTo(user);
    }

    @Mutation(() => Project)
    async createProject(@Args("input") input: CreateProjectInput, @CurrentUser() user: User): Promise<Project> {
        return this.projectsService.create(input, user);
    }

    @ResolveField(() => [ProjectMember])
    async members(@Parent() project: Project): Promise<ProjectMember[]> {
        return project.members.loadItems();
    }
}
