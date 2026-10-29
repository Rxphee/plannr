import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import type { PaginationArgs } from "@src/common/pagination.args.js";

import type { PaginatedUsers } from "./dto/paginated-users.js";
import { User } from "./user.entity.js";

const DEVELOPMENT_USER_SUBJECT = "development-user";

@Injectable()
export class UsersService {
    constructor(private readonly entityManager: EntityManager) {}

    // Sorted by name, then by ID, so that two users with the same name keep their order across pages
    async findAll({ offset, limit }: PaginationArgs): Promise<PaginatedUsers> {
        const [nodes, totalCount] = await this.entityManager.findAndCount(
            User,
            {},
            { orderBy: { firstName: "asc", lastName: "asc", id: "asc" }, offset, limit },
        );
        return { nodes, totalCount };
    }

    // Stands in for the logged-in user until the OIDC login exists
    async findOrCreateDevelopmentUser(): Promise<User> {
        const existingUser = await this.entityManager.findOne(User, { oidcSubject: DEVELOPMENT_USER_SUBJECT });

        if (existingUser) {
            return existingUser;
        }

        const user = this.entityManager.create(User, {
            oidcSubject: DEVELOPMENT_USER_SUBJECT,
            email: "dev@plannr.localhost",
            firstName: "Development",
            lastName: "User",
        });

        await this.entityManager.flush();
        return user;
    }
}
