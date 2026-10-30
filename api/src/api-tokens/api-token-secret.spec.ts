import { describe, expect, it } from "vitest";

import { generateApiToken, hashSecret, isApiToken, matchesSecretHash, parseApiToken } from "./api-token-secret.js";

describe("generateApiToken", () => {
    it("generates a token with the prefix, the lookup ID and the secret", () => {
        const { token, lookupId } = generateApiToken();
        expect(token).toMatch(new RegExp(`^plannr_${lookupId}_[\\w-]{43}$`));
    });

    it("stores only the hash of the secret", () => {
        const { token, secretHash } = generateApiToken();
        const parsedToken = parseApiToken(token);
        expect(parsedToken).toBeDefined();
        expect(token).not.toContain(secretHash);
        expect(hashSecret(parsedToken?.secret ?? "")).toBe(secretHash);
    });

    it("generates a different token every time", () => {
        expect(generateApiToken().token).not.toBe(generateApiToken().token);
    });
});

describe("parseApiToken", () => {
    it("splits a token into lookup ID and secret, even if the secret contains underscores", () => {
        const secret = "abc_def-".padEnd(43, "x");
        expect(parseApiToken(`plannr_0123456789abcdef_${secret}`)).toEqual({ lookupId: "0123456789abcdef", secret });
    });

    it.each([
        "plannr_0123456789abcdef",
        `plannr_0123456789ABCDEF_${"x".repeat(43)}`,
        `plannr_0123456789abcdef_${"x".repeat(42)}`,
        `plannr_0123456789abcdef_${"x".repeat(43)} `,
        `github_0123456789abcdef_${"x".repeat(43)}`,
    ])("rejects %j", (token) => {
        expect(parseApiToken(token)).toBeUndefined();
    });
});

describe("isApiToken", () => {
    it("recognizes Plannr tokens by their prefix, so other bearer tokens are left to other logins", () => {
        expect(isApiToken("plannr_anything")).toBe(true);
        expect(isApiToken("eyJhbGciOiJSUzI1NiJ9.e30.signature")).toBe(false);
    });
});

describe("matchesSecretHash", () => {
    it("accepts the secret of the hash only", () => {
        const secretHash = hashSecret("secret");
        expect(matchesSecretHash("secret", secretHash)).toBe(true);
        expect(matchesSecretHash("Secret", secretHash)).toBe(false);
    });
});
