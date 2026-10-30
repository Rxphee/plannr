import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { describe, expect, it } from "vitest";

import { UpdateLabelInput } from "./update-label.input.js";

function validate(plain: Record<string, unknown>) {
    return validateSync(plainToInstance(UpdateLabelInput, plain)).map(({ property }) => property);
}

describe("UpdateLabelInput", () => {
    it("accepts an empty change", () => {
        expect(validate({})).toEqual([]);
    });

    it.each([
        ["name", { name: " " }],
        ["name", { name: "a".repeat(31) }],
        ["color", { color: "purple" }],
    ])("rejects an invalid %s", (property, data) => {
        expect(validate(data)).toEqual([property]);
    });
});
