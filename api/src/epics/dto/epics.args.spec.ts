import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { describe, expect, it } from "vitest";

import { EpicsArgs } from "./epics.args.js";

function validate(plain: Record<string, unknown>) {
    const args = plainToInstance(EpicsArgs, { projectId: "0b7f3a52-5c1e-4f0e-9d39-2f4a8e6b1c7d", offset: 0, limit: 25, ...plain });
    return { args, invalidProperties: validateSync(args).map(({ property }) => property) };
}

describe("EpicsArgs", () => {
    it("accepts a search", () => {
        expect(validate({ search: "header" }).invalidProperties).toEqual([]);
    });

    it("trims the search", () => {
        expect(validate({ search: " header " }).args.search).toBe("header");
    });

    it.each([
        ["projectId", { projectId: "42" }],
        ["limit", { limit: 101 }],
    ])("rejects an invalid %s", (property, data) => {
        expect(validate(data).invalidProperties).toEqual([property]);
    });
});
