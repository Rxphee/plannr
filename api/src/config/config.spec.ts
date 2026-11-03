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
    OIDC_ISSUER: "http://localhost:8180",
    OIDC_AUDIENCE: "plannr",
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

    describe("storage", () => {
        const storageEnvironment = {
            S3_ENDPOINT: "http://localhost:3900",
            S3_REGION: "garage",
            S3_BUCKET: "plannr",
            S3_ACCESS_KEY_ID: "GK0123456789abcdef01234567",
            S3_SECRET_ACCESS_KEY: "secret",
        };

        it("has no storage without S3_ENDPOINT, even if other S3 variables are set", () => {
            expect(createConfig(environment).storage).toBeNull();
            expect(createConfig({ ...environment, ...storageEnvironment, S3_ENDPOINT: "" }).storage).toBeNull();
        });

        it("reads the storage when S3_ENDPOINT is set", () => {
            expect(createConfig({ ...environment, ...storageEnvironment }).storage).toEqual({
                endpoint: "http://localhost:3900",
                region: "garage",
                bucket: "plannr",
                accessKeyId: "GK0123456789abcdef01234567",
                secretAccessKey: "secret",
                forcePathStyle: false,
            });
        });

        it("reads S3_FORCE_PATH_STYLE as a boolean", () => {
            expect(createConfig({ ...environment, ...storageEnvironment, S3_FORCE_PATH_STYLE: "true" }).storage?.forcePathStyle).toBe(true);
            expect(createConfig({ ...environment, ...storageEnvironment, S3_FORCE_PATH_STYLE: "false" }).storage?.forcePathStyle).toBe(false);
            expect(() => createConfig({ ...environment, ...storageEnvironment, S3_FORCE_PATH_STYLE: "yes" })).toThrow(/S3_FORCE_PATH_STYLE/);
        });

        it("requires every other S3 variable when S3_ENDPOINT is set", () => {
            expect(() => createConfig({ ...environment, ...storageEnvironment, S3_SECRET_ACCESS_KEY: "" })).toThrow(/S3_SECRET_ACCESS_KEY/);
            expect(() => createConfig({ ...environment, S3_ENDPOINT: "http://localhost:3900" })).toThrow(/S3_BUCKET/);
        });

        it("rejects an S3_ENDPOINT that is no URL", () => {
            expect(() => createConfig({ ...environment, ...storageEnvironment, S3_ENDPOINT: "localhost:3900" })).toThrow(/S3_ENDPOINT/);
        });
    });
});
