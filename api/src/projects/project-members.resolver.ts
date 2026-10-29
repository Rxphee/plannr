import { ParseUUIDPipe } from "@nestjs/common";
import { Args, ID, Mutation, Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "@src/auth/current-user.decorator.js";
import { User } from "@src/users/user.entity.js";

import { ProjectMemberInput } from "./dto/project-member.input.js";
import { Project } from "./entities/project.entity.js";
import { ProjectMember } from "./entities/project-member.entity.js";
import { ProjectsService } from "./projects.service.js";

@Resolver(() => ProjectMember)
export class ProjectMembersResolver {
    constructor(private readonly projectsService: ProjectsService) {}

    @Mutation(() => ProjectMember)
    async addProjectMember(@Args("input") input: ProjectMemberInput, @CurrentUser() user: User): Promise<ProjectMember> {
        return this.projectsService.addMember(input, user);
    }

    @Mutation(() => ProjectMember, { description: "Fails if the project would lose its last owner" })
    async changeProjectMemberRole(@Args("input") input: ProjectMemberInput, @CurrentUser() user: User): Promise<ProjectMember> {
        return this.projectsService.changeMemberRole(input, user);
    }

    @Mutation(() => Boolean, { description: "Fails if the project would lose its last owner" })
    async removeProjectMember(
        @Args("projectId", { type: () => ID }, new ParseUUIDPipe({ version: "4" })) projectId: string,
        @Args("userId", { type: () => ID }, new ParseUUIDPipe({ version: "4" })) userId: string,
        @CurrentUser() user: User,
    ): Promise<boolean> {
        await this.projectsService.removeMember(projectId, userId, user);
        return true;
    }

    @ResolveField(() => Project)
    async project(@Parent() member: ProjectMember): Promise<Project> {
        return member.project.loadOrFail();
    }

    @ResolveField(() => User)
    async user(@Parent() member: ProjectMember): Promise<User> {
        return member.user.loadOrFail();
    }
}
