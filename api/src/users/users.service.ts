import { EntityManager, UniqueConstraintViolationException } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import type { PaginationArgs } from "@src/common/pagination.args.js";

import type { PaginatedUsers } from "./dto/paginated-users.js";
import { User } from "./user.entity.js";

// What the identity provider knows about a user
export interface UserIdentity {
    oidcSubject: string;
    email: string;
    firstName: string;
    lastName: string;
}

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

    async findByOidcSubject(oidcSubject: string): Promise<User | null> {
        return this.entityManager.findOne(User, { oidcSubject });
    }

    // Creates the user on the first login and takes over a changed email address or name on later ones
    async syncIdentity(identity: UserIdentity): Promise<User> {
        const user = await this.findByOidcSubject(identity.oidcSubject);
        if (user) {
            this.entityManager.assign(user, identity);
            await this.entityManager.flush();
            return user;
        }

        // A separate fork, so a failed insert does not stay in the unit of work of the request
        const fork = this.entityManager.fork();
        fork.create(User, identity);
        try {
            await fork.flush();
        } catch (error) {
            // The first page after a login sends several requests at once, another one may have created the user meanwhile
            if (!(error instanceof UniqueConstraintViolationException)) {
                throw error;
            }
            const concurrentlyCreatedUser = await this.findByOidcSubject(identity.oidcSubject);
            if (!concurrentlyCreatedUser) {
                // e.g. another account uses the same email address
                throw error;
            }
            return concurrentlyCreatedUser;
        }
        return this.entityManager.findOneOrFail(User, { oidcSubject: identity.oidcSubject });
    }
}
