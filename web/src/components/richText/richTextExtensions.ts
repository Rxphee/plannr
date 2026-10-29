import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Placeholder } from "@tiptap/extensions";
import { Markdown } from "@tiptap/markdown";
import { StarterKit } from "@tiptap/starter-kit";

// Rich text is stored as Markdown (GFM with task lists), so only formatting that Markdown can express is offered
export function createRichTextExtensions({ placeholder }: { placeholder?: string } = {}) {
    return [
        StarterKit.configure({
            heading: { levels: [2, 3] },
            underline: false,
            link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
        }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Placeholder.configure({ placeholder }),
        Markdown,
    ];
}

// Tiptap keeps empty paragraphs as lines of "&nbsp;". Stored Markdown drops them, so it stays clean for the export and for agents.
export function removeEmptyParagraphs(markdown: string): string {
    return markdown
        .replace(/^&nbsp;$/gm, "")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}
