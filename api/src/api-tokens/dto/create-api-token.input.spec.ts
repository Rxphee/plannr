import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { describe, expect, it } from "vitest";

import { CreateApiTokenInput } from "./create-api-token.input.js";

function validate(plain: Record<string, unknown>) {
    const input = plainToInstance(CreateApiTokenInput, { name: "Claude Code", ...plain });
    return { input, invalidProperties: validateSync(input).map(({ property }) => property) };
}

const inOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);

describe("CreateApiTokenInput", () => {
    it.each([
        ["without expiry", {}],
        ["with an expiry in the future", { expiresAt: inOneDay }],
    ])("accepts a token %s", (_, plain) => {
        expect(validate(plain).invalidProperties).toEqual([]);
    });

    it("trims the name", () => {
        expect(validate({ name: "  Claude Code " }).input.name).toBe("Claude Code");
    });

    it.each([
        ["a blank name", { name: "   " }],
        ["a name longer than 80 characters", { name: "a".repeat(81) }],
    ])("rejects %s", (_, plain) => {
        expect(validate(plain).invalidProperties).toEqual(["name"]);
    });

    it.each([
        ["an expiry in the past", new Date(Date.now() - 1000)],
        ["no date", "tomorrow"],
    ])("rejects %s", (_, expiresAt) => {
        expect(validate({ expiresAt }).invalidProperties).toEqual(["expiresAt"]);
    });
});
