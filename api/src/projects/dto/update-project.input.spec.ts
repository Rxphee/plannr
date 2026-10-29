import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { describe, expect, it } from "vitest";

import { UpdateProjectInput } from "./update-project.input.js";

function validate(plain: Record<string, unknown>) {
    const input = plainToInstance(UpdateProjectInput, { name: "Plannr", description: "", ...plain });
    return { input, invalidProperties: validateSync(input).map(({ property }) => property) };
}

describe("UpdateProjectInput", () => {
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
});
