import { describe, expect, it } from "vitest";

import { markdownToPlainText } from "./markdownToPlainText";

describe("markdownToPlainText", () => {
    it("keeps plain text as it is", () => {
        expect(markdownToPlainText("New design and content for the company website.")).toBe("New design and content for the company website.");
    });

    it("drops the syntax of headings, marks and lists", () => {
        expect(markdownToPlainText("## Goals\n\nA **calm** design with *clear* `code`.\n\n- One\n- Two\n\n1. First")).toBe(
            "Goals A calm design with clear code. One Two First",
        );
    });

    it("keeps the text of checklist items", () => {
        expect(markdownToPlainText("- [ ] Open\n- [x] Done\n  - [ ] Nested")).toBe("Open Done Nested");
    });

    it("joins the lines of a paragraph", () => {
        expect(markdownToPlainText("First line\nsecond line")).toBe("First line second line");
    });
});
