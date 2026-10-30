// Loaded by Nest in the app, the decorators of the environment variables need it
import "reflect-metadata";

import { describe, expect, it } from "vitest";

import { createConfig } from "./config.js";

const environment = {
    NODE_ENV: "test",
    POSTGRESQL_HOST: "localhost",
    POSTGRESQL_PORT: "5432",
    POSTGRESQL_DB: "main",
    POSTGRESQL_USER: "plannr",
    POSTGRESQL_PASSWORD: "plannr",
    API_PORT: "4000",
    CORS_ALLOWED_ORIGIN: "^http://localhost:3000$",
    OIDC_ISSUER: "http://localhost:8180/realms/plannr",
    OIDC_AUDIENCE: "plannr-api",
};

describe("createConfig", () => {
    it("reads the super-admin email addresses lowercased", () => {
        const { superAdminEmails } = createConfig({ ...environment, SUPER_ADMIN_EMAILS: " Ada@Plannr.localhost, max@plannr.localhost ," });
        expect(superAdminEmails).toEqual(["ada@plannr.localhost", "max@plannr.localhost"]);
    });

    it("has no super-admin without SUPER_ADMIN_EMAILS", () => {
        expect(createConfig(environment).superAdminEmails).toEqual([]);
        expect(createConfig({ ...environment, SUPER_ADMIN_EMAILS: "" }).superAdminEmails).toEqual([]);
    });

    it("rejects an invalid super-admin email address", () => {
        expect(() => createConfig({ ...environment, SUPER_ADMIN_EMAILS: "ada@plannr.localhost, ada" })).toThrow(/SUPER_ADMIN_EMAILS/);
    });
});
