type ShortcutEvent = Pick<KeyboardEvent, "key" | "metaKey" | "ctrlKey" | "altKey" | "shiftKey" | "repeat" | "isComposing" | "target">;

// Typing there must not trigger a single-key shortcut
const TYPING_TARGETS = "input, textarea, select, [contenteditable]:not([contenteditable='false'])";
// A shortcut must not open something on top of a dialog or a menu that is open
const OVERLAYS = "[role='dialog'], [role='alertdialog'], [role='menu'], [role='listbox']";

// ⌘K on macOS, Ctrl+K elsewhere; also while typing, like in other apps
export function isCommandMenuShortcut(event: ShortcutEvent): boolean {
    return (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "k";
}

// C like in Linear, only outside text fields, dialogs and menus and without modifiers, so it never clashes with the browser
export function isQuickCaptureShortcut(event: ShortcutEvent): boolean {
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey || event.repeat || event.isComposing || event.key !== "c") {
        return false;
    }
    return !isInside(event.target, `${TYPING_TARGETS}, ${OVERLAYS}`);
}

function isInside(target: EventTarget | null, selector: string): boolean {
    return target !== null && "closest" in target && (target as Element).closest(selector) !== null;
}
