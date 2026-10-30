import { ParseUUIDPipe, UseGuards } from "@nestjs/common";
import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { RejectApiTokenGuard } from "@src/api-tokens/reject-api-token.guard.js";
import { CurrentUser } from "@src/auth/current-user.decorator.js";
import { InstanceRole, InstanceRolesService } from "@src/instance-roles/instance-roles.service.js";

import { PaginatedUsers } from "./dto/paginated-users.js";
import { UsersArgs } from "./dto/users.args.js";
import { User } from "./user.entity.js";
import { UsersService } from "./users.service.js";

@Resolver(() => User)
export class UsersResolver {
    constructor(
        private readonly usersService: UsersService,
        private readonly instanceRoles: InstanceRolesService,
    ) {}

    @Query(() => User, { description: "The logged-in user" })
    currentUser(@CurrentUser() user: User): User {
        return user;
    }

    @Query(() => PaginatedUsers, { description: "All users who have logged in at least once, sorted by name" })
    async users(@Args() args: UsersArgs): Promise<PaginatedUsers> {
        return this.usersService.findAll(args);
    }

    @Query(() => Boolean, { description: "Whether the current user can appoint and remove admins, which only the super-admin can" })
    canAppointAdmins(@CurrentUser() user: User): boolean {
        return this.instanceRoles.canAppointAdmins(user);
    }

    // Not with an API token, so a leaked token cannot hand out admin rights
    @UseGuards(RejectApiTokenGuard)
    @Mutation(() => User, { description: "Appoints or removes an admin, only for the super-admin" })
    async setUserAdmin(
        @Args("id", { type: () => ID }, new ParseUUIDPipe({ version: "4" })) id: string,
        @Args("isAdmin") isAdmin: boolean,
        @CurrentUser() user: User,
    ): Promise<User> {
        return this.usersService.setAdmin({ id, isAdmin }, user);
    }

    @ResolveField(() => InstanceRole, { description: "The role in the whole instance; the super-admin comes from SUPER_ADMIN_EMAILS" })
    instanceRole(@Parent() user: User): InstanceRole {
        return this.instanceRoles.roleOf(user);
    }
}
