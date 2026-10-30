import { UnauthorizedException } from "@nestjs/common";
import type { User } from "@src/users/user.entity.js";
import type { UsersService } from "@src/users/users.service.js";
import { errors } from "jose";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RequestWithUser } from "../request-with-user.js";
import { OidcAuthStrategy } from "./oidc-auth.strategy.js";
import type { OidcIssuer } from "./oidc-issuer.js";

const accessToken = "header.payload.signature";
const userInfo = { sub: "user-1", email: "Erika@Example.com", given_name: "Erika", family_name: "Mustermann" };
const user = { id: "1", oidcSubject: "user-1" } as User;

function request(authorization?: string): RequestWithUser {
    return { headers: { authorization } };
}

describe("OidcAuthStrategy", () => {
    let issuer: { verifyAccessToken: ReturnType<typeof vi.fn>; fetchUserInfo: ReturnType<typeof vi.fn> };
    let usersService: { findByOidcSubject: ReturnType<typeof vi.fn>; syncIdentity: ReturnType<typeof vi.fn> };
    let strategy: OidcAuthStrategy;

    beforeEach(() => {
        issuer = {
            verifyAccessToken: vi.fn().mockResolvedValue({ sub: "user-1", jti: "token-1" }),
            fetchUserInfo: vi.fn().mockResolvedValue(userInfo),
        };
        usersService = { findByOidcSubject: vi.fn().mockResolvedValue(user), syncIdentity: vi.fn().mockResolvedValue(user) };
        strategy = new OidcAuthStrategy(issuer as unknown as OidcIssuer, usersService as unknown as UsersService);
    });

    it("leaves requests without a bearer token to other strategies", async () => {
        await expect(strategy.authenticate(request())).resolves.toBeUndefined();
        await expect(strategy.authenticate(request("Basic dXNlcjpwYXNz"))).resolves.toBeUndefined();
    });

    it("leaves bearer tokens that are no JWT to other strategies", async () => {
        await expect(strategy.authenticate(request("Bearer plannr_personal-api-token"))).resolves.toBeUndefined();
        expect(issuer.verifyAccessToken).not.toHaveBeenCalled();
    });

    it("rejects an invalid access token", async () => {
        issuer.verifyAccessToken.mockRejectedValue(new errors.JWTExpired("expired", {}));
        await expect(strategy.authenticate(request(`Bearer ${accessToken}`))).rejects.toThrow(UnauthorizedException);
    });

    it("creates or updates the user from the userinfo claims", async () => {
        await expect(strategy.authenticate(request(`Bearer ${accessToken}`))).resolves.toBe(user);

        expect(issuer.fetchUserInfo).toHaveBeenCalledWith(accessToken);
        expect(usersService.syncIdentity).toHaveBeenCalledWith({
            oidcSubject: "user-1",
            email: "erika@example.com",
            firstName: "Erika",
            lastName: "Mustermann",
        });
    });

    it("syncs the claims only once per access token", async () => {
        await strategy.authenticate(request(`Bearer ${accessToken}`));
        await strategy.authenticate(request(`Bearer ${accessToken}`));
        expect(usersService.syncIdentity).toHaveBeenCalledTimes(1);
        expect(usersService.findByOidcSubject).toHaveBeenCalledWith("user-1");

        issuer.verifyAccessToken.mockResolvedValue({ sub: "user-1", jti: "token-2" });
        await strategy.authenticate(request(`Bearer ${accessToken}`));
        expect(usersService.syncIdentity).toHaveBeenCalledTimes(2);
    });

    it("syncs again if the user is gone", async () => {
        await strategy.authenticate(request(`Bearer ${accessToken}`));
        usersService.findByOidcSubject.mockResolvedValue(null);
        await strategy.authenticate(request(`Bearer ${accessToken}`));
        expect(usersService.syncIdentity).toHaveBeenCalledTimes(2);
    });

    it("rejects claims without a valid email address", async () => {
        issuer.fetchUserInfo.mockResolvedValue({ ...userInfo, email: "no-email" });
        await expect(strategy.authenticate(request(`Bearer ${accessToken}`))).rejects.toThrow(UnauthorizedException);
        expect(usersService.syncIdentity).not.toHaveBeenCalled();
    });

    it("rejects claims of another subject", async () => {
        issuer.fetchUserInfo.mockResolvedValue({ ...userInfo, sub: "user-2" });
        await expect(strategy.authenticate(request(`Bearer ${accessToken}`))).rejects.toThrow(UnauthorizedException);
        expect(usersService.syncIdentity).not.toHaveBeenCalled();
    });
});
