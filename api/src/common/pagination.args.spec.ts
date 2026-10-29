import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { describe, expect, it } from "vitest";

import { MAX_PAGE_SIZE, PaginationArgs } from "./pagination.args.js";

function invalidProperties(plain: Record<string, unknown>) {
    return validateSync(plainToInstance(PaginationArgs, { offset: 0, limit: 50, ...plain })).map(({ property }) => property);
}

describe("PaginationArgs", () => {
    it("accepts a page up to the largest size", () => {
        expect(invalidProperties({ offset: 200, limit: MAX_PAGE_SIZE })).toEqual([]);
    });

    it.each([
        ["offset", { offset: -1 }],
        ["limit", { limit: 0 }],
        ["limit", { limit: MAX_PAGE_SIZE + 1 }],
    ])("rejects an invalid %s", (property, data) => {
        expect(invalidProperties(data)).toEqual([property]);
    });
});
