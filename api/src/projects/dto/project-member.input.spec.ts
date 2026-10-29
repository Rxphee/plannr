import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { describe, expect, it } from "vitest";

import { ProjectMemberInput } from "./project-member.input.js";

function validate(plain: Record<string, unknown>) {
    const input = plainToInstance(ProjectMemberInput, {
        projectId: "0b7f3a52-5c1e-4f0e-9d39-2f4a8e6b1c7d",
        userId: "6e2d9c41-8a3b-4b7f-a1e5-3c9d7f2b8e60",
        role: "member",
        ...plain,
    });
    return validateSync(input).map(({ property }) => property);
}

describe("ProjectMemberInput", () => {
    it("accepts a valid member", () => {
        expect(validate({})).toEqual([]);
    });

    it.each(["projectId", "userId"])("rejects a %s that is no UUID", (property) => {
        expect(validate({ [property]: "42" })).toEqual([property]);
    });

    it("rejects an unknown role", () => {
        expect(validate({ role: "admin" })).toEqual(["role"]);
    });
});
