import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import type { User } from "@src/users/user.entity.js";
import { UsersService } from "@src/users/users.service.js";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { errors } from "jose";

import type { AuthStrategy } from "../auth-strategy.js";
import { getBearerToken, type RequestWithUser } from "../request-with-user.js";
import { type AccessTokenPayload, OidcIssuer } from "./oidc-issuer.js";
import { UserInfoClaims } from "./user-info-claims.js";

// Logs in with the access token of the OIDC login (a JWT). Users are created on their first login.
@Injectable()
export class OidcAuthStrategy implements AuthStrategy {
    private readonly logger = new Logger(OidcAuthStrategy.name);
    // The token whose claims each user was last synced with, so the userinfo endpoint is asked once per token instead of per request
    private readonly syncedTokens = new Map<string, string>();

    constructor(
        private readonly issuer: OidcIssuer,
        private readonly usersService: UsersService,
    ) {}

    async authenticate(request: RequestWithUser): Promise<User | undefined> {
        const token = getBearerToken(request);
        // Other bearer tokens are no JWT and belong to another strategy
        if (!token || token.split(".").length !== 3) {
            return undefined;
        }

        const payload = await this.verify(token);
        const tokenId = payload.jti ?? `${payload.iat}`;
        if (this.syncedTokens.get(payload.sub) === tokenId) {
            const user = await this.usersService.findByOidcSubject(payload.sub);
            // Missing e.g. after the fixtures reset the database
            if (user) {
                return user;
            }
        }

        const claims = await this.fetchUserInfoClaims(token, payload.sub);
        const user = await this.usersService.syncIdentity({
            oidcSubject: claims.sub,
            email: claims.email,
            firstName: claims.given_name,
            lastName: claims.family_name,
        });
        this.syncedTokens.set(payload.sub, tokenId);
        return user;
    }

    private async verify(token: string): Promise<AccessTokenPayload> {
        try {
            return await this.issuer.verifyAccessToken(token);
        } catch (error) {
            if (error instanceof errors.JOSEError) {
                throw new UnauthorizedException("The access token is invalid or expired");
            }
            throw error;
        }
    }

    private async fetchUserInfoClaims(token: string, subject: string): Promise<UserInfoClaims> {
        const claims = plainToInstance(UserInfoClaims, await this.issuer.fetchUserInfo(token));
        const validationErrors = await validate(claims);
        if (validationErrors.length > 0) {
            this.logger.warn(`Invalid userinfo claims for ${subject}: ${validationErrors.map(({ property }) => property).join(", ")}`);
            throw new UnauthorizedException("The identity provider sent no valid email address, first and last name");
        }
        // Required by OIDC, otherwise the claims could belong to another user
        if (claims.sub !== subject) {
            throw new UnauthorizedException("The userinfo belongs to another subject than the access token");
        }
        return claims;
    }
}
