import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { describe, expect, it } from "vitest";

import { UpdateIssueInput } from "./update-issue.input.js";

function validate(plain: Record<string, unknown>) {
    return validateSync(plainToInstance(UpdateIssueInput, plain)).map(({ property }) => property);
}

describe("UpdateIssueInput", () => {
    it("accepts an empty change", () => {
        expect(validate({})).toEqual([]);
    });

    it("accepts null to remove the due date", () => {
        expect(validate({ dueDate: null })).toEqual([]);
    });

    it.each([
        ["title", { title: " " }],
        ["status", { status: "blocked" }],
        ["dueDate", { dueDate: "tomorrow" }],
    ])("rejects an invalid %s", (property, data) => {
        expect(validate(data)).toEqual([property]);
    });
});
