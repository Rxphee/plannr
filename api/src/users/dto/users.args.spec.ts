import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { describe, expect, it } from "vitest";

import { UsersArgs } from "./users.args.js";

function validate(plain: Record<string, unknown>) {
    const args = plainToInstance(UsersArgs, { offset: 0, limit: 25, ...plain });
    return { args, invalidProperties: validateSync(args).map(({ property }) => property) };
}

describe("UsersArgs", () => {
    it("accepts a search", () => {
        expect(validate({ search: "ada" }).invalidProperties).toEqual([]);
    });

    it("trims the search", () => {
        expect(validate({ search: " Ada Admin " }).args.search).toBe("Ada Admin");
    });

    it("rejects an invalid limit", () => {
        expect(validate({ limit: 101 }).invalidProperties).toEqual(["limit"]);
    });
});
