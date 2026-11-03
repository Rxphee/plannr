"use client";

import { Button } from "@src/components/ui/Button";
import { cn } from "@src/lib/utils";
import { type Editor, EditorContent, useEditor, useEditorState } from "@tiptap/react";
import {
    BoldIcon,
    CodeIcon,
    Heading1Icon,
    Heading2Icon,
    Heading3Icon,
    ImageIcon,
    ItalicIcon,
    ListChecksIcon,
    ListIcon,
    ListOrderedIcon,
    Loader2Icon,
    type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

import { createRichTextExtensions, removeEmptyParagraphs } from "./richTextExtensions";
import { SUPPORTED_IMAGE_TYPES } from "./uploadImage";
import { useImageUploads } from "./useImageUploads";

interface RichTextEditorProps {
    // Markdown
    value: string;
    onChange?: (value: string) => void;
    // Shows the text without toolbar and border, e.g. for viewers
    readOnly?: boolean;
    placeholder?: string;
    id?: string;
    className?: string;
    "aria-label"?: string;
    "aria-invalid"?: boolean;
    "aria-describedby"?: string;
}

export function RichTextEditor({ value, onChange, readOnly, placeholder, id, className, ...ariaProps }: RichTextEditorProps) {
    // The Markdown of what the editor shows, so a new value from outside (e.g. a form reset) can be told apart from the user's own typing
    const currentMarkdown = useRef(value);
    const imageUploads = useImageUploads();
    // The editor keeps the handlers it was created with, so they reach the current uploads through this ref
    const insertImagesRef = useRef(imageUploads.insertImages);
    useEffect(() => {
        insertImagesRef.current = imageUploads.insertImages;
    });

    const editor = useEditor({
        extensions: createRichTextExtensions({ placeholder }),
        content: value,
        contentType: "markdown",
        editable: !readOnly,
        // The server cannot render the editor, so it starts on the client
        immediatelyRender: false,
        editorProps: {
            attributes: {
                ...(id && { id }),
                ...(!readOnly && { role: "textbox", "aria-multiline": "true" }),
                ...(ariaProps["aria-label"] && { "aria-label": ariaProps["aria-label"] }),
                ...(ariaProps["aria-invalid"] && { "aria-invalid": "true" }),
                ...(ariaProps["aria-describedby"] && { "aria-describedby": ariaProps["aria-describedby"] }),
                class: cn("rich-text outline-none", !readOnly && "min-h-24 px-3 py-2"),
            },
            handlePaste: (view, event) => insertImagesRef.current(view, [...(event.clipboardData?.files ?? [])]),
            handleDrop: (view, event, _slice, isMovedWithinEditor) => {
                if (isMovedWithinEditor || !event.dataTransfer?.files.length) {
                    return false;
                }
                const position = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
                return insertImagesRef.current(view, [...event.dataTransfer.files], position);
            },
        },
        // Tiptap writes Markdown in its own style (e.g. *italic* for _italic_), which alone is no change by the user
        onCreate: ({ editor: createdEditor }) => {
            currentMarkdown.current = removeEmptyParagraphs(createdEditor.getMarkdown());
        },
        // Tiptap also reports changes that leave the Markdown as it is, e.g. when it normalizes the document
        onUpdate: ({ editor: updatedEditor }) => {
            const markdown = removeEmptyParagraphs(updatedEditor.getMarkdown());
            if (markdown !== currentMarkdown.current) {
                currentMarkdown.current = markdown;
                onChange?.(markdown);
            }
        },
    });

    useEffect(() => {
        if (editor && value !== currentMarkdown.current) {
            editor.commands.setContent(value, { contentType: "markdown", emitUpdate: false });
            currentMarkdown.current = removeEmptyParagraphs(editor.getMarkdown());
        }
    }, [editor, value]);

    useEffect(() => {
        editor?.setEditable(!readOnly);
    }, [editor, readOnly]);

    if (readOnly) {
        return <EditorContent editor={editor} className={className} />;
    }

    return (
        <div
            className={cn(
                "border-input focus-within:border-ring focus-within:ring-ring/50 has-aria-invalid:border-destructive has-aria-invalid:ring-destructive/20 dark:bg-input/30 rounded-md border bg-transparent shadow-xs transition-[color,box-shadow] focus-within:ring-3",
                className,
            )}
        >
            {editor && <RichTextToolbar editor={editor} imageUploads={imageUploads} />}
            <EditorContent editor={editor} />
        </div>
    );
}

interface ToolbarAction {
    // Tells the actions apart and names their label in the messages
    name: "bold" | "italic" | "code" | "heading1" | "heading2" | "heading3" | "bulletList" | "orderedList" | "taskList";
    icon: LucideIcon;
    isActive: (editor: Editor) => boolean;
    run: (editor: Editor) => void;
}

const toolbarActions: ToolbarAction[] = [
    { name: "bold", icon: BoldIcon, isActive: (editor) => editor.isActive("bold"), run: (editor) => editor.chain().focus().toggleBold().run() },
    {
        name: "italic",
        icon: ItalicIcon,
        isActive: (editor) => editor.isActive("italic"),
        run: (editor) => editor.chain().focus().toggleItalic().run(),
    },
    { name: "code", icon: CodeIcon, isActive: (editor) => editor.isActive("code"), run: (editor) => editor.chain().focus().toggleCode().run() },
    ...([1, 2, 3] as const).map((level): ToolbarAction => ({
        name: `heading${level}`,
        icon: [Heading1Icon, Heading2Icon, Heading3Icon][level - 1],
        isActive: (editor) => editor.isActive("heading", { level }),
        run: (editor) => editor.chain().focus().toggleHeading({ level }).run(),
    })),
    {
        name: "bulletList",
        icon: ListIcon,
        isActive: (editor) => editor.isActive("bulletList"),
        run: (editor) => editor.chain().focus().toggleBulletList().run(),
    },
    {
        name: "orderedList",
        icon: ListOrderedIcon,
        isActive: (editor) => editor.isActive("orderedList"),
        run: (editor) => editor.chain().focus().toggleOrderedList().run(),
    },
    {
        name: "taskList",
        icon: ListChecksIcon,
        isActive: (editor) => editor.isActive("taskList"),
        run: (editor) => editor.chain().focus().toggleTaskList().run(),
    },
];

function RichTextToolbar({ editor, imageUploads }: { editor: Editor; imageUploads: ReturnType<typeof useImageUploads> }) {
    const t = useTranslations("richText");
    const activeNames = useEditorState({
        editor,
        selector: ({ editor: currentEditor }) => toolbarActions.filter((action) => action.isActive(currentEditor)).map((action) => action.name),
        equalityFn: (previous, next) => previous.join() === next?.join(),
    });

    return (
        <div className="flex flex-wrap gap-0.5 border-b p-1">
            {toolbarActions.map(({ name, icon: Icon, run }) => {
                const isActive = activeNames.includes(name);
                const label = t(name);

                return (
                    <Button
                        key={name}
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        title={label}
                        aria-label={label}
                        aria-pressed={isActive}
                        className={cn(isActive && "bg-muted text-foreground")}
                        onClick={() => run(editor)}
                    >
                        <Icon />
                    </Button>
                );
            })}
            {imageUploads.isEnabled && <ImageButton editor={editor} imageUploads={imageUploads} />}
        </div>
    );
}

function ImageButton({ editor, imageUploads }: { editor: Editor; imageUploads: ReturnType<typeof useImageUploads> }) {
    const t = useTranslations("richText");
    const fileInput = useRef<HTMLInputElement>(null);
    const label = t("image");

    return (
        <>
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                title={label}
                aria-label={label}
                aria-busy={imageUploads.isUploading}
                onClick={() => fileInput.current?.click()}
            >
                {imageUploads.isUploading ? <Loader2Icon className="animate-spin" /> : <ImageIcon />}
            </Button>
            <input
                ref={fileInput}
                type="file"
                accept={SUPPORTED_IMAGE_TYPES.join(",")}
                multiple
                hidden
                onChange={(event) => {
                    imageUploads.insertImages(editor.view, [...(event.target.files ?? [])]);
                    // Lets the same file be chosen again
                    event.target.value = "";
                }}
            />
        </>
    );
}
