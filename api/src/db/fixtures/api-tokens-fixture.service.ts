import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { ApiTokensService } from "@src/api-tokens/api-tokens.service.js";
import type { User } from "@src/users/user.entity.js";

const DAY_MS = 24 * 60 * 60 * 1000;

function daysFromNow(days: number): Date {
    return new Date(Date.now() + days * DAY_MS);
}

@Injectable()
export class ApiTokensFixtureService {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly apiTokensService: ApiTokensService,
    ) {}

    // Their secrets are thrown away like after any creation, a token to try out is created in the settings
    async generateApiTokens(user: User): Promise<void> {
        const { apiToken: claudeCode } = await this.apiTokensService.create({ name: "Claude Code on the MacBook" }, user);
        claudeCode.lastUsedAt = daysFromNow(-1);

        await this.apiTokensService.create({ name: "Backup script", expiresAt: daysFromNow(90) }, user);

        const { apiToken: oldLaptop } = await this.apiTokensService.create({ name: "Old laptop", expiresAt: daysFromNow(30) }, user);
        oldLaptop.expiresAt = daysFromNow(-10);
        oldLaptop.lastUsedAt = daysFromNow(-12);

        const { apiToken: revoked } = await this.apiTokensService.create({ name: "Revoked token" }, user);
        revoked.revokedAt = daysFromNow(-2);

        await this.entityManager.flush();
    }
}
