import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { User } from "@src/users/user.entity.js";
import { UsersService } from "@src/users/users.service.js";

export interface FixtureUsers {
    developmentUser: User;
    // Not a member of the development user's projects, to check what stays hidden
    otherUser: User;
}

@Injectable()
export class UsersFixtureService {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly usersService: UsersService,
    ) {}

    async generateUsers(): Promise<FixtureUsers> {
        const developmentUser = await this.usersService.findOrCreateDevelopmentUser();

        const otherUser = this.entityManager.create(User, {
            oidcSubject: "fixture-erika-mustermann",
            firstName: "Erika",
            lastName: "Mustermann",
            email: "erika.mustermann@plannr.localhost",
        });

        await this.entityManager.flush();

        return { developmentUser, otherUser };
    }
}
