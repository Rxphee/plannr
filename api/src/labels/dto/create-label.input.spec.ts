import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { describe, expect, it } from "vitest";

import { CreateLabelInput } from "./create-label.input.js";

function validate(plain: Record<string, unknown>) {
    const input = plainToInstance(CreateLabelInput, { name: "upstream", color: "red", ...plain });
    return { input, invalidProperties: validateSync(input).map(({ property }) => property) };
}

describe("CreateLabelInput", () => {
    it("accepts a valid label", () => {
        expect(validate({}).invalidProperties).toEqual([]);
    });

    it("trims the name", () => {
        expect(validate({ name: "  upstream " }).input.name).toBe("upstream");
    });

    it.each([
        ["name", { name: "   " }],
        ["name", { name: "a".repeat(31) }],
        ["color", { color: "purple" }],
    ])("rejects an invalid %s", (property, data) => {
        expect(validate(data).invalidProperties).toEqual([property]);
    });
});
