import { ParseUUIDPipe } from "@nestjs/common";
import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "@src/auth/current-user.decorator.js";
import type { User } from "@src/users/user.entity.js";

import { CreateProjectInput } from "./dto/create-project.input.js";
import { UpdateProjectInput } from "./dto/update-project.input.js";
import { Project, ProjectStatus } from "./entities/project.entity.js";
import { ProjectMember } from "./entities/project-member.entity.js";
import { ProjectsService } from "./projects.service.js";

@Resolver(() => Project)
export class ProjectsResolver {
    constructor(private readonly projectsService: ProjectsService) {}

    @Query(() => [Project], { description: "Projects visible to the current user, sorted by name" })
    async projects(@CurrentUser() user: User): Promise<Project[]> {
        return this.projectsService.findAllVisibleTo(user);
    }

    @Query(() => Project, { nullable: true, description: "The project with the key, if the current user can see it" })
    async project(@Args("key") key: string, @CurrentUser() user: User): Promise<Project | null> {
        return this.projectsService.findOneVisibleTo(key, user);
    }

    @Mutation(() => Project)
    async createProject(@Args("input") input: CreateProjectInput, @CurrentUser() user: User): Promise<Project> {
        return this.projectsService.create(input, user);
    }

    @Mutation(() => Project)
    async updateProject(
        @Args("id", { type: () => ID }, new ParseUUIDPipe({ version: "4" })) id: string,
        @Args("input") input: UpdateProjectInput,
        @CurrentUser() user: User,
    ): Promise<Project> {
        return this.projectsService.update(id, input, user);
    }

    @Mutation(() => Project)
    async changeProjectStatus(
        @Args("id", { type: () => ID }, new ParseUUIDPipe({ version: "4" })) id: string,
        @Args("status", { type: () => ProjectStatus }) status: ProjectStatus,
        @CurrentUser() user: User,
    ): Promise<Project> {
        return this.projectsService.changeStatus(id, status, user);
    }

    @Mutation(() => Boolean, { description: "Deletes an archived project with everything in it" })
    async deleteProject(
        @Args("id", { type: () => ID }, new ParseUUIDPipe({ version: "4" })) id: string,
        @CurrentUser() user: User,
    ): Promise<boolean> {
        await this.projectsService.delete(id, user);
        return true;
    }

    @ResolveField(() => [ProjectMember], { description: "Sorted by name" })
    async members(@Parent() project: Project): Promise<ProjectMember[]> {
        return this.projectsService.findMembers(project);
    }

    @ResolveField(() => Boolean, { description: "Whether the current user can change the settings, status and members of the project" })
    async canManage(@Parent() project: Project, @CurrentUser() user: User): Promise<boolean> {
        return this.projectsService.canManage(project, user);
    }

    @ResolveField(() => Boolean, { description: "Whether the current user can create and edit the epics and issues of the project" })
    async canContribute(@Parent() project: Project, @CurrentUser() user: User): Promise<boolean> {
        return this.projectsService.canContribute(project, user);
    }
}
