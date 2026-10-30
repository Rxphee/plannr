import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { describe, expect, it } from "vitest";

import { ProjectsArgs } from "./projects.args.js";

function toArgs(plain: Record<string, unknown>) {
    return plainToInstance(ProjectsArgs, { offset: 0, limit: 25, ...plain });
}

function invalidProperties(plain: Record<string, unknown>) {
    return validateSync(toArgs(plain)).map(({ property }) => property);
}

describe("ProjectsArgs", () => {
    it("accepts statuses", () => {
        expect(invalidProperties({ statuses: ["active", "paused"] })).toEqual([]);
    });

    it("accepts no statuses", () => {
        expect(invalidProperties({})).toEqual([]);
    });

    it("trims the search", () => {
        expect(toArgs({ search: " web " }).search).toBe("web");
    });

    it.each([
        ["statuses", { statuses: ["done"] }],
        ["limit", { limit: 101 }],
    ])("rejects an invalid %s", (property, data) => {
        expect(invalidProperties(data)).toEqual([property]);
    });
});
