import { readFileSync } from "node:fs";

import { afterEach, describe, expect, it, vi } from "vitest";

import { developmentSecrets, requireSecret } from "./requireEnv";

describe("requireSecret", () => {
    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("refuses the development value in production", () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("SESSION_SECRET", developmentSecrets.SESSION_SECRET);
        expect(() => requireSecret("SESSION_SECRET")).toThrow(/development value/);
    });

    it("accepts a secret of its own in production", () => {
        vi.stubEnv("NODE_ENV", "production");
        vi.stubEnv("OIDC_CLIENT_SECRET", "a-secret-of-its-own");
        expect(requireSecret("OIDC_CLIENT_SECRET")).toBe("a-secret-of-its-own");
    });

    it("accepts the development value in development", () => {
        vi.stubEnv("NODE_ENV", "development");
        vi.stubEnv("SESSION_SECRET", developmentSecrets.SESSION_SECRET);
        expect(requireSecret("SESSION_SECRET")).toBe(developmentSecrets.SESSION_SECRET);
    });

    it("refuses a missing secret", () => {
        vi.stubEnv("SESSION_SECRET", "");
        expect(() => requireSecret("SESSION_SECRET")).toThrow(/not set/);
    });

    it("knows the development values of .env", () => {
        const env = readFileSync(new URL("../../../.env", import.meta.url), "utf8");
        for (const [name, value] of Object.entries(developmentSecrets)) {
            expect(env).toMatch(new RegExp(`^${name}=${value}$`, "m"));
        }
    });
});
