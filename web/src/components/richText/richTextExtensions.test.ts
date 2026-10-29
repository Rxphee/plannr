import { MarkdownManager } from "@tiptap/markdown";
import { describe, expect, it } from "vitest";

import { createRichTextExtensions, removeEmptyParagraphs } from "./richTextExtensions";

const markdown = new MarkdownManager({ extensions: createRichTextExtensions() });

function roundTrip(text: string): string {
    return markdown.serialize(markdown.parse(text));
}

describe("createRichTextExtensions", () => {
    it.each([
        ["checklists", "- [ ] Open\n- [x] Done\n  - [ ] Nested"],
        ["lists", "- One\n- Two\n\n1. First\n2. Second"],
        ["headings and marks", "# Goal\n\n## Steps\n\n### Details\n\nText with **bold**, *italic* and `code`."],
        ["links", "See [the pull request](https://github.com/Rxphee/plannr/pull/12)."],
        ["code blocks and quotes", "> Quote\n\n```ts\nconst answer = 42;\n```"],
    ])("keeps %s when the Markdown is read and written again", (_, text) => {
        expect(roundTrip(text)).toBe(text);
    });
});

describe("removeEmptyParagraphs", () => {
    it("drops the empty paragraphs between blocks", () => {
        expect(removeEmptyParagraphs("Intro\n\n&nbsp;\n\n&nbsp;\n\n- [ ] Retest\n\n&nbsp;")).toBe("Intro\n\n- [ ] Retest");
    });

    it("keeps a non-breaking space inside a line", () => {
        expect(removeEmptyParagraphs("10&nbsp;km")).toBe("10&nbsp;km");
    });
});
