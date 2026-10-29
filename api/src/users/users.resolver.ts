import { Args, Query, Resolver } from "@nestjs/graphql";
import { PaginationArgs } from "@src/common/pagination.args.js";

import { PaginatedUsers } from "./dto/paginated-users.js";
import { User } from "./user.entity.js";
import { UsersService } from "./users.service.js";

@Resolver(() => User)
export class UsersResolver {
    constructor(private readonly usersService: UsersService) {}

    @Query(() => PaginatedUsers, { description: "All users who have logged in at least once, sorted by name" })
    async users(@Args() args: PaginationArgs): Promise<PaginatedUsers> {
        return this.usersService.findAll(args);
    }
}
