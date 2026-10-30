import { UnauthorizedException } from "@nestjs/common";
import type { RequestWithUser } from "@src/auth/request-with-user.js";
import { User } from "@src/users/user.entity.js";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiTokenAuthenticator } from "./api-token.authenticator.js";
import type { ApiTokensService } from "./api-tokens.service.js";
import type { ApiToken } from "./entities/api-token.entity.js";

const token = `plannr_0123456789abcdef_${"x".repeat(43)}`;
const user = Object.assign(new User(), { firstName: "Erika", lastName: "Mustermann" });
const apiToken = { user: { getEntity: () => user } } as unknown as ApiToken;

function requestWith(authorization?: string): RequestWithUser {
    return { headers: { authorization } };
}

describe("ApiTokenAuthenticator", () => {
    const findActiveByToken = vi.fn<ApiTokensService["findActiveByToken"]>();
    const authenticator = new ApiTokenAuthenticator({ findActiveByToken } as unknown as ApiTokensService);

    beforeEach(() => {
        findActiveByToken.mockReset();
    });

    it("logs in the user of a valid token", async () => {
        findActiveByToken.mockResolvedValue(apiToken);
        const request = requestWith(`Bearer ${token}`);

        await expect(authenticator.authenticate(request)).resolves.toBe(user);
        expect(findActiveByToken).toHaveBeenCalledWith(token);
        expect(request.apiToken).toBe(apiToken);
    });

    it("looks up the token only once per request", async () => {
        findActiveByToken.mockResolvedValue(apiToken);
        const request = requestWith(`bearer ${token}`);

        await authenticator.authenticate(request);
        await expect(authenticator.authenticate(request)).resolves.toBe(user);
        expect(findActiveByToken).toHaveBeenCalledTimes(1);
    });

    it.each([
        ["no Authorization header", undefined],
        ["another scheme", `Basic ${token}`],
        ["a bearer token of another login", "Bearer eyJhbGciOiJSUzI1NiJ9.e30.signature"],
    ])("leaves a request with %s to the other logins", async (_, authorization) => {
        await expect(authenticator.authenticate(requestWith(authorization))).resolves.toBeUndefined();
        expect(findActiveByToken).not.toHaveBeenCalled();
    });

    it("refuses an invalid, expired or revoked token instead of falling back to another login", async () => {
        findActiveByToken.mockResolvedValue(null);

        await expect(authenticator.authenticate(requestWith(`Bearer ${token}`))).rejects.toThrow(UnauthorizedException);
    });
});
