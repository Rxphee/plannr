import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { User } from "@src/users/user.entity.js";
import { UsersService } from "@src/users/users.service.js";

import { developmentUsers } from "./development-users.js";

// The first three can log in at the local identity provider, see README.md
export interface FixtureUsers {
    // An admin who is a member of no project, but sees all of them
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

        const team = teamNames.map(([firstName, lastName]) => this.createUser(firstName, lastName));

        await this.entityManager.flush();

        return { admin, developmentUser, otherUser, team };
    }

    private createUser(firstName: string, lastName: string): User {
        const name = `${firstName}-${lastName}`.toLowerCase();
        return this.entityManager.create(User, {
            oidcSubject: `fixture-${name}`,
            firstName,
            lastName,
            email: `${name.replace("-", ".")}@plannr.localhost`,
        });
    }
}
