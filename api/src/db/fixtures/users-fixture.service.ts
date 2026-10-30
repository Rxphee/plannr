import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { User } from "@src/users/user.entity.js";
import { UsersService } from "@src/users/users.service.js";

import { developmentUsers } from "./development-users.js";

// The first three can log in at the local identity provider, see README.md
export interface FixtureUsers {
    // The super-admin (SUPER_ADMIN_EMAILS in .env), who is a member of no project, but sees all of them.
    // Also an admin, so she keeps the admin rights without SUPER_ADMIN_EMAILS.
    admin: User;
    // Max Mustermann, who owns most projects
    developmentUser: User;
    // Erika Mustermann, a member of the website, with a project of her own that Max does not see
    otherUser: User;
    // Enough people to see how lists of members behave in a large project
    team: User[];
}

const teamNames = [
    ["Lukas", "Berger"],
    ["Sophie", "Huber"],
    ["Jonas", "Wagner"],
    ["Lena", "Gruber"],
    ["Felix", "Bauer"],
    ["Anna", "Pichler"],
    ["David", "Steiner"],
    ["Marie", "Moser"],
    ["Paul", "Hofer"],
    ["Julia", "Leitner"],
    ["Tobias", "Mayer"],
    ["Sarah", "Eder"],
];

@Injectable()
export class UsersFixtureService {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly usersService: UsersService,
    ) {}

    async generateUsers(): Promise<FixtureUsers> {
        // Created like on their first login
        const admin = await this.usersService.syncIdentity(developmentUsers.admin);
        admin.isAdmin = true;
        const developmentUser = await this.usersService.syncIdentity(developmentUsers.max);
        const otherUser = await this.usersService.syncIdentity(developmentUsers.erika);

        // The first one is an admin, so the list of users shows one next to the super-admin
        const team = teamNames.map(([firstName, lastName], index) => this.createUser({ firstName, lastName, isAdmin: index === 0 }));

        await this.entityManager.flush();

        return { admin, developmentUser, otherUser, team };
    }

    private createUser({ firstName, lastName, isAdmin }: { firstName: string; lastName: string; isAdmin: boolean }): User {
        const name = `${firstName}-${lastName}`.toLowerCase();
        return this.entityManager.create(User, {
            oidcSubject: `fixture-${name}`,
            firstName,
            lastName,
            email: `${name.replace("-", ".")}@plannr.localhost`,
            isEmailVerified: true,
            isAdmin,
        });
    }
}
