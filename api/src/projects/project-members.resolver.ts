import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { User } from "@src/users/user.entity.js";

import { Project } from "./entities/project.entity.js";
import { ProjectMember } from "./entities/project-member.entity.js";

@Resolver(() => ProjectMember)
export class ProjectMembersResolver {
    @ResolveField(() => Project)
    async project(@Parent() member: ProjectMember): Promise<Project> {
        return member.project.loadOrFail();
    }

    @ResolveField(() => User)
    async user(@Parent() member: ProjectMember): Promise<User> {
        return member.user.loadOrFail();
    }
}
