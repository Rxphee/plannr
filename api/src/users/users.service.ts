import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";

import { User } from "./user.entity.js";

const DEVELOPMENT_USER_SUBJECT = "development-user";

@Injectable()
export class UsersService {
    constructor(private readonly entityManager: EntityManager) {}

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
