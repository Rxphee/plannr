import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { User } from "@src/users/user.entity.js";
import { UsersService } from "@src/users/users.service.js";

export interface FixtureUsers {
    developmentUser: User;
    // Not a member of the development user's projects, to check what stays hidden
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
        const developmentUser = await this.usersService.findOrCreateDevelopmentUser();

        const otherUser = this.createUser("Erika", "Mustermann");
        const team = teamNames.map(([firstName, lastName]) => this.createUser(firstName, lastName));

        await this.entityManager.flush();

        return { developmentUser, otherUser, team };
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
