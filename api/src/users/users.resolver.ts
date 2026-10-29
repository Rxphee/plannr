import { Query, Resolver } from "@nestjs/graphql";

import { User } from "./user.entity.js";
import { UsersService } from "./users.service.js";

@Resolver(() => User)
export class UsersResolver {
    constructor(private readonly usersService: UsersService) {}

    @Query(() => [User], { description: "All users who have logged in at least once, sorted by name" })
    async users(): Promise<User[]> {
        return this.usersService.findAll();
    }
}
