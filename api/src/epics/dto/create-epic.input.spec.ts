import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { describe, expect, it } from "vitest";

import { CreateEpicInput } from "./create-epic.input.js";

function validate(plain: Record<string, unknown>) {
    const input = plainToInstance(CreateEpicInput, { projectId: "0b7f3a52-5c1e-4f0e-9d39-2f4a8e6b1c7d", name: "Design", description: "", ...plain });
    return { input, invalidProperties: validateSync(input).map(({ property }) => property) };
}

describe("CreateEpicInput", () => {
    it("accepts a valid epic", () => {
        expect(validate({}).invalidProperties).toEqual([]);
    });

    it("trims name and description", () => {
        const { input } = validate({ name: "  Design ", description: " - [ ] Colors\n" });
        expect(input.name).toBe("Design");
        expect(input.description).toBe("- [ ] Colors");
    });

    it("rejects a blank name", () => {
        expect(validate({ name: "   " }).invalidProperties).toEqual(["name"]);
    });

    it("rejects a name longer than 80 characters", () => {
        expect(validate({ name: "a".repeat(81) }).invalidProperties).toEqual(["name"]);
    });

    it("rejects a projectId that is no UUID", () => {
        expect(validate({ projectId: "42" }).invalidProperties).toEqual(["projectId"]);
    });
});
