import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { describe, expect, it } from "vitest";

import { CreateProjectInput } from "./create-project.input.js";

function validate(plain: Record<string, unknown>) {
    const input = plainToInstance(CreateProjectInput, { name: "Plannr", key: "PLAN", description: "", ...plain });
    return { input, invalidProperties: validateSync(input).map(({ property }) => property) };
}

describe("CreateProjectInput", () => {
    it("accepts a valid project", () => {
        expect(validate({}).invalidProperties).toEqual([]);
    });

    it("trims name and description", () => {
        const { input } = validate({ name: "  Plannr ", description: " Issue tracker\n" });
        expect(input.name).toBe("Plannr");
        expect(input.description).toBe("Issue tracker");
    });

    it("rejects a blank name", () => {
        expect(validate({ name: "   " }).invalidProperties).toEqual(["name"]);
    });

    it("rejects a name longer than 50 characters", () => {
        expect(validate({ name: "a".repeat(51) }).invalidProperties).toEqual(["name"]);
    });

    it.each([42, null])("rejects the non-string key %j", (key) => {
        expect(validate({ key }).invalidProperties).toEqual(["key"]);
    });

    it.each(["P", "PLANNR", "plan", "PL4N", " PLAN"])("rejects the key %j", (key) => {
        expect(validate({ key }).invalidProperties).toEqual(["key"]);
    });

    it.each(["PL", "PLANR"])("accepts the key %j", (key) => {
        expect(validate({ key }).invalidProperties).toEqual([]);
    });
});
