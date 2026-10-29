import { validateSync } from "class-validator";
import { describe, expect, it } from "vitest";

import { User } from "./user.entity.js";

function createUser(data: Partial<User> = {}): User {
    return Object.assign(
        new User(),
        { oidcSubject: "284620137648209921", firstName: "Erika", lastName: "Mustermann", email: "erika@example.com" },
        data,
    );
}

describe("User", () => {
    it("accepts a valid user", () => {
        expect(validateSync(createUser())).toEqual([]);
    });

    it.each([
        ["email", { email: "no-email" }],
        ["oidcSubject", { oidcSubject: "" }],
        ["firstName", { firstName: "" }],
        ["lastName", { lastName: "" }],
    ])("rejects an invalid %s", (property, data) => {
        expect(validateSync(createUser(data)).map((error) => error.property)).toEqual([property]);
    });
});
