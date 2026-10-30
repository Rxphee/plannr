import { EntityManager, type FilterQuery, UniqueConstraintViolationException } from "@mikro-orm/postgresql";
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { containsPattern } from "@src/db/contains-pattern.js";
import { InstanceRolesService } from "@src/instance-roles/instance-roles.service.js";

import type { PaginatedUsers } from "./dto/paginated-users.js";
import type { UsersArgs } from "./dto/users.args.js";
import { User } from "./user.entity.js";

// What the identity provider knows about a user
export interface UserIdentity {
    oidcSubject: string;
    email: string;
    isEmailVerified: boolean;
    firstName: string;
    lastName: string;
}

@Injectable()
export class UsersService {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly instanceRoles: InstanceRolesService,
    ) {}

    // Sorted by name, then by ID, so that two users with the same name keep their order across pages
    async findAll({ search, offset, limit }: UsersArgs): Promise<PaginatedUsers> {
        // Each word on its own, so "Anna Pichler" finds the user although first and last name are separate columns
        const wordConditions = (search?.split(/\s+/) ?? []).map((word): FilterQuery<User> => {
            const pattern = containsPattern(word);
            return { $or: [{ firstName: { $ilike: pattern } }, { lastName: { $ilike: pattern } }, { email: { $ilike: pattern } }] };
        });
        const [nodes, totalCount] = await this.entityManager.findAndCount(User, wordConditions.length > 0 ? { $and: wordConditions } : {}, {
            orderBy: { firstName: "asc", lastName: "asc", id: "asc" },
            offset,
            limit,
        });
        return { nodes, totalCount };
    }

    // Only the super-admin appoints and removes admins
    async setAdmin({ id, isAdmin }: { id: string; isAdmin: boolean }, actingUser: User): Promise<User> {
        if (!this.instanceRoles.canAppointAdmins(actingUser)) {
            throw new ForbiddenException("Only the super-admin can appoint admins");
        }
        const user = await this.entityManager.findOne(User, id);
        if (!user) {
            throw new NotFoundException("The user does not exist");
        }
        if (this.instanceRoles.isSuperAdmin(user)) {
            throw new BadRequestException(`${user.firstName} ${user.lastName} is super-admin through SUPER_ADMIN_EMAILS and always has admin rights`);
        }
        user.isAdmin = isAdmin;
        await this.entityManager.flush();
        return user;
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
