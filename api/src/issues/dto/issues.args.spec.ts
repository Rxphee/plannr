import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { describe, expect, it } from "vitest";

import { IssuesArgs } from "./issues.args.js";

function validate(plain: Record<string, unknown>) {
    const args = plainToInstance(IssuesArgs, { projectId: "0b7f3a52-5c1e-4f0e-9d39-2f4a8e6b1c7d", offset: 0, limit: 50, ...plain });
    return { args, invalidProperties: validateSync(args).map(({ property }) => property) };
}

describe("IssuesArgs", () => {
    it("accepts a filter", () => {
        expect(
            validate({
                filter: {
                    statuses: ["todo", "inProgress"],
                    types: ["bug"],
                    priorities: ["high", "normal"],
                    epicIds: ["6e2d9c41-8a3b-4b7f-a1e5-3c9d7f2b8e60"],
                    search: "header",
                },
            }).invalidProperties,
        ).toEqual([]);
    });

    it("trims the search", () => {
        expect(validate({ filter: { search: " WEB-42 " } }).args.filter?.search).toBe("WEB-42");
    });

    it.each([
        ["offset", { offset: -1 }],
        ["limit", { limit: 0 }],
        ["limit", { limit: 101 }],
        ["filter", { filter: { statuses: ["blocked"] } }],
        ["filter", { filter: { types: ["story"] } }],
        ["filter", { filter: { priorities: ["urgent"] } }],
        ["filter", { filter: { epicIds: ["42"] } }],
    ])("rejects an invalid %s", (property, data) => {
        expect(validate(data).invalidProperties).toEqual([property]);
    });
});
