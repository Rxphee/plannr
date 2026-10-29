import { validateSync } from "class-validator";
import { describe, expect, it } from "vitest";

import { Epic } from "./epic.entity.js";

function createEpic(data: Partial<Epic> = {}): Epic {
    return Object.assign(new Epic(), { name: "Design" }, data);
}

describe("Epic", () => {
    it("accepts a valid epic", () => {
        expect(validateSync(createEpic())).toEqual([]);
    });

    it.each([
        ["name", { name: "" }],
        ["name", { name: "a".repeat(81) }],
        ["description", { description: 42 as unknown as string }],
    ])("rejects an invalid %s", (property, data) => {
        expect(validateSync(createEpic(data)).map((error) => error.property)).toEqual([property]);
    });
});
