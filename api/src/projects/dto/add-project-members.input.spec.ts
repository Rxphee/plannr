import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { describe, expect, it } from "vitest";

import { AddProjectMembersInput } from "./add-project-members.input.js";

const userId = "6e2d9c41-8a3b-4b7f-a1e5-3c9d7f2b8e60";
const otherUserId = "3c9d7f2b-8e60-4a1e-b5a3-6e2d9c418a3b";

function validate(plain: Record<string, unknown>) {
    const input = plainToInstance(AddProjectMembersInput, {
        projectId: "0b7f3a52-5c1e-4f0e-9d39-2f4a8e6b1c7d",
        userIds: [userId, otherUserId],
        role: "member",
        ...plain,
    });
    return validateSync(input).map(({ property }) => property);
}

describe("AddProjectMembersInput", () => {
    it("accepts several users", () => {
        expect(validate({})).toEqual([]);
    });

    it.each([
        ["projectId", { projectId: "42" }],
        ["userIds", { userIds: [] }],
        ["userIds", { userIds: [userId, userId] }],
        ["userIds", { userIds: [userId, "42"] }],
        ["role", { role: "admin" }],
    ])("rejects an invalid %s", (property, data) => {
        expect(validate(data)).toEqual([property]);
    });
});
