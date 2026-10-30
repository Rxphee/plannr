import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { describe, expect, it } from "vitest";

import { CreateIssueInput } from "./create-issue.input.js";

function validate(plain: Record<string, unknown>) {
    const input = plainToInstance(CreateIssueInput, {
        projectId: "0b7f3a52-5c1e-4f0e-9d39-2f4a8e6b1c7d",
        title: "Fix the header",
        type: "task",
        priority: "normal",
        description: "",
        labelIds: [],
        ...plain,
    });
    return { input, invalidProperties: validateSync(input).map(({ property }) => property) };
}

describe("CreateIssueInput", () => {
    it("accepts a valid issue", () => {
        expect(validate({}).invalidProperties).toEqual([]);
    });

    it("accepts an epic, a due date and labels", () => {
        expect(
            validate({ epicId: "6e2d9c41-8a3b-4b7f-a1e5-3c9d7f2b8e60", dueDate: "2026-11-05", labelIds: ["9c4e2a71-3b5d-4f8e-a6c2-1d7b9e3f5a80"] })
                .invalidProperties,
        ).toEqual([]);
    });

    it("trims title and description", () => {
        const { input } = validate({ title: " Fix the header  ", description: "\n- [ ] Tablets\n" });
        expect(input.title).toBe("Fix the header");
        expect(input.description).toBe("- [ ] Tablets");
    });

    it.each([
        ["title", { title: "   " }],
        ["title", { title: "a".repeat(201) }],
        ["type", { type: "story" }],
        ["priority", { priority: "urgent" }],
        ["epicId", { epicId: "42" }],
        ["labelIds", { labelIds: ["42"] }],
        ["dueDate", { dueDate: "2026-11-05T10:00:00Z" }],
    ])("rejects an invalid %s", (property, data) => {
        expect(validate(data).invalidProperties).toEqual([property]);
    });
});
