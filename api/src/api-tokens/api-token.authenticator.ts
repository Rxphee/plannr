import { Injectable, UnauthorizedException } from "@nestjs/common";
import type { AuthStrategy } from "@src/auth/auth-strategy.js";
import type { RequestWithUser } from "@src/auth/request-with-user.js";
import type { User } from "@src/users/user.entity.js";

import { isApiToken } from "./api-token-secret.js";
import { ApiTokensService } from "./api-tokens.service.js";

const BEARER_PATTERN = /^Bearer\s+(\S+)$/i;

// The login with personal API tokens, which the auth guard runs before any other login.
// Requests without a Plannr token are left to the other logins, a wrong Plannr token is refused instead of falling back to them.
@Injectable()
export class ApiTokenAuthenticator implements AuthStrategy {
    constructor(private readonly apiTokensService: ApiTokensService) {}

    async authenticate(request: RequestWithUser): Promise<User | undefined> {
        const token = BEARER_PATTERN.exec(request.headers.authorization ?? "")?.[1];
        if (!token || !isApiToken(token)) {
            return undefined;
        }
        // A GraphQL request runs the guard once per root field
        if (request.apiToken) {
            return request.apiToken.user.getEntity();
        }

        const apiToken = await this.apiTokensService.findActiveByToken(token);
        if (!apiToken) {
            throw new UnauthorizedException("The API token is invalid, expired or revoked");
        }
        request.apiToken = apiToken;
        return apiToken.user.getEntity();
    }
}
