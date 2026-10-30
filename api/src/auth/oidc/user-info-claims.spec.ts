import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { describe, expect, it } from "vitest";

import { UserInfoClaims } from "./user-info-claims.js";

function validate(plain: Record<string, unknown>) {
    const claims = plainToInstance(UserInfoClaims, {
        sub: "user-1",
        email: "erika@example.com",
        given_name: "Erika",
        family_name: "Mustermann",
        ...plain,
    });
    return { claims, invalidProperties: validateSync(claims).map(({ property }) => property) };
}

describe("UserInfoClaims", () => {
    it("accepts valid claims", () => {
        expect(validate({}).invalidProperties).toEqual([]);
    });

    it("normalizes the email address and trims the names", () => {
        const { claims } = validate({ email: " Erika@Example.COM ", given_name: " Erika ", family_name: "Mustermann\n" });
        expect(claims).toMatchObject({ email: "erika@example.com", given_name: "Erika", family_name: "Mustermann" });
    });

    it.each([
        [true, true],
        [false, false],
        ["true", false],
        [undefined, false],
    ])("reads email_verified %j as %j", (emailVerified, expected) => {
        expect(validate({ email_verified: emailVerified }).claims.email_verified).toBe(expected);
    });

    it.each([
        ["sub", { sub: undefined }],
        ["email", { email: "no-email" }],
        ["email", { email: undefined }],
        ["given_name", { given_name: "  " }],
        ["family_name", { family_name: undefined }],
    ])("rejects an invalid %s", (property, plain) => {
        expect(validate(plain).invalidProperties).toEqual([property]);
    });
});
