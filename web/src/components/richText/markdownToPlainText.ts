import { generateText } from "@tiptap/core";
import { MarkdownManager } from "@tiptap/markdown";

import { createRichTextExtensions } from "./richTextExtensions";

const extensions = createRichTextExtensions();
const markdownManager = new MarkdownManager({ extensions });

// For a preview of a line or two, e.g. on a card, where headings and lists would only show their Markdown syntax
export function markdownToPlainText(markdown: string): string {
    return generateText(markdownManager.parse(markdown), extensions, { blockSeparator: " " }).replace(/\s+/g, " ").trim();
}
