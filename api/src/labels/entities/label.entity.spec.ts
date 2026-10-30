import { validateSync } from "class-validator";
import { describe, expect, it } from "vitest";

import { Label, LabelColor } from "./label.entity.js";

function createLabel(data: Partial<Label> = {}): Label {
    return Object.assign(new Label(), { name: "upstream" }, data);
}

describe("Label", () => {
    it("accepts a valid label", () => {
        expect(validateSync(createLabel())).toEqual([]);
    });

    it("is gray by default", () => {
        expect(createLabel().color).toBe(LabelColor.gray);
    });

    it.each([
        ["name", { name: "" }],
        ["name", { name: "a".repeat(31) }],
        ["color", { color: "purple" as LabelColor }],
    ])("rejects an invalid %s", (property, data) => {
        expect(validateSync(createLabel(data)).map((error) => error.property)).toEqual([property]);
    });
});
