import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { describe, expect, it } from "vitest";

import { ProjectMembersArgs } from "./project-members.args.js";

function validate(plain: Record<string, unknown>) {
    const args = plainToInstance(ProjectMembersArgs, { offset: 0, limit: 10, ...plain });
    return { args, invalidProperties: validateSync(args).map(({ property }) => property) };
}

describe("ProjectMembersArgs", () => {
    it("accepts a search", () => {
        expect(validate({ search: "anna" }).invalidProperties).toEqual([]);
    });

    it("trims the search", () => {
        expect(validate({ search: " Anna Pichler " }).args.search).toBe("Anna Pichler");
    });

    it("rejects an invalid limit", () => {
        expect(validate({ limit: 101 }).invalidProperties).toEqual(["limit"]);
    });
});
