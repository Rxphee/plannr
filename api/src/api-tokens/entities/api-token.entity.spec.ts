import { validateSync } from "class-validator";
import { describe, expect, it } from "vitest";

import { ApiToken, isApiTokenActive } from "./api-token.entity.js";

const now = new Date("2026-10-30T12:00:00Z");

describe("ApiToken", () => {
    function createApiToken(data: Partial<ApiToken> = {}): ApiToken {
        return Object.assign(new ApiToken(), { name: "Claude Code", lookupId: "0123456789abcdef", secretHash: "hash" }, data);
    }

    it("accepts a valid token", () => {
        expect(validateSync(createApiToken())).toEqual([]);
    });

    it.each([
        ["a blank name", { name: "" }],
        ["a name longer than 80 characters", { name: "a".repeat(81) }],
    ])("rejects %s", (_, data) => {
        expect(validateSync(createApiToken(data)).map(({ property }) => property)).toEqual(["name"]);
    });
});

describe("isApiTokenActive", () => {
    it("accepts a token without expiry until it is revoked", () => {
        expect(isApiTokenActive({ expiresAt: null, revokedAt: null }, now)).toBe(true);
        expect(isApiTokenActive({ expiresAt: null, revokedAt: new Date("2026-10-29T12:00:00Z") }, now)).toBe(false);
    });

    it("accepts a token until it expires", () => {
        expect(isApiTokenActive({ expiresAt: new Date("2026-10-30T12:00:01Z"), revokedAt: null }, now)).toBe(true);
        expect(isApiTokenActive({ expiresAt: now, revokedAt: null }, now)).toBe(false);
    });
});
