import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable, NotFoundException } from "@nestjs/common";
import type { PaginationArgs } from "@src/common/pagination.args.js";
import type { User } from "@src/users/user.entity.js";

import { generateApiToken, matchesSecretHash, parseApiToken } from "./api-token-secret.js";
import type { CreateApiTokenInput } from "./dto/create-api-token.input.js";
import type { CreatedApiToken } from "./dto/created-api-token.js";
import type { PaginatedApiTokens } from "./dto/paginated-api-tokens.js";
import { ApiToken, isApiTokenActive } from "./entities/api-token.entity.js";

// lastUsedAt is written at most once a minute per token, so a busy client does not cause a write on every request
const LAST_USED_AT_PRECISION_MS = 60 * 1000;

@Injectable()
export class ApiTokensService {
    constructor(private readonly entityManager: EntityManager) {}

    // Revoked tokens are kept, but nobody needs to see them again
    async findAll({ offset, limit }: PaginationArgs, user: User): Promise<PaginatedApiTokens> {
        const [nodes, totalCount] = await this.entityManager.findAndCount(
            ApiToken,
            { user, revokedAt: null },
            { orderBy: { createdAt: "desc", id: "asc" }, offset, limit },
        );
        return { nodes, totalCount };
    }

    async create({ name, expiresAt = null }: CreateApiTokenInput, user: User): Promise<CreatedApiToken> {
        const { token, lookupId, secretHash } = generateApiToken();
        const apiToken = this.entityManager.create(ApiToken, { user, name, lookupId, secretHash, expiresAt });
        await this.entityManager.flush();
        return { apiToken, token };
    }

    async revoke(id: string, user: User): Promise<void> {
        const apiToken = await this.entityManager.findOne(ApiToken, { id, user, revokedAt: null });
        if (!apiToken) {
            throw new NotFoundException("The API token does not exist");
        }
        apiToken.revokedAt = new Date();
        await this.entityManager.flush();
    }

    // The token with its user, if it exists and is neither expired nor revoked
    async findActiveByToken(token: string): Promise<ApiToken | null> {
        const parsedToken = parseApiToken(token);
        if (!parsedToken) {
            return null;
        }
        const apiToken = await this.entityManager.findOne(ApiToken, { lookupId: parsedToken.lookupId }, { populate: ["user"] });
        const now = new Date();
        if (!apiToken || !matchesSecretHash(parsedToken.secret, apiToken.secretHash) || !isApiTokenActive(apiToken, now)) {
            return null;
        }

        if (!apiToken.lastUsedAt || now.getTime() - apiToken.lastUsedAt.getTime() >= LAST_USED_AT_PRECISION_MS) {
            apiToken.lastUsedAt = now;
            await this.entityManager.flush();
        }
        return apiToken;
    }
}
