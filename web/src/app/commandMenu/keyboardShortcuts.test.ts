import { describe, expect, it } from "vitest";

import { isCommandMenuShortcut, isQuickCaptureShortcut } from "./keyboardShortcuts";

// An element that matches the selectors it is inside of
function elementInside(...selectors: string[]): EventTarget {
    return { closest: (selector: string) => (selectors.some((inside) => selector.includes(inside)) ? {} : null) } as unknown as EventTarget;
}

function keyEvent(key: string, change: Partial<KeyboardEvent> = {}) {
    return {
        key,
        metaKey: false,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        repeat: false,
        isComposing: false,
        target: elementInside(),
        ...change,
    };
}

describe("isCommandMenuShortcut", () => {
    it.each([
        ["⌘K", keyEvent("k", { metaKey: true })],
        ["Ctrl+K", keyEvent("k", { ctrlKey: true })],
        ["⌘K with caps lock", keyEvent("K", { metaKey: true })],
        ["⌘K in a text field", keyEvent("k", { metaKey: true, target: elementInside("input") })],
    ])("opens on %s", (_, event) => {
        expect(isCommandMenuShortcut(event)).toBe(true);
    });

    it.each([
        ["K", keyEvent("k")],
        ["⌘⇧K", keyEvent("k", { metaKey: true, shiftKey: true })],
        ["⌘⌥K", keyEvent("k", { metaKey: true, altKey: true })],
    ])("ignores %s", (_, event) => {
        expect(isCommandMenuShortcut(event)).toBe(false);
    });
});

describe("isQuickCaptureShortcut", () => {
    it("opens on C outside of text fields", () => {
        expect(isQuickCaptureShortcut(keyEvent("c"))).toBe(true);
    });

    it.each([
        ["⌘C", keyEvent("c", { metaKey: true })],
        ["Ctrl+C", keyEvent("c", { ctrlKey: true })],
        ["⇧C", keyEvent("C", { shiftKey: true })],
        ["a held key", keyEvent("c", { repeat: true })],
        ["a key while composing", keyEvent("c", { isComposing: true })],
        ["C in a text field", keyEvent("c", { target: elementInside("input") })],
        ["C in the editor", keyEvent("c", { target: elementInside("[contenteditable]") })],
        ["C in a dialog", keyEvent("c", { target: elementInside("[role='dialog']") })],
        ["C in a menu", keyEvent("c", { target: elementInside("[role='menu']") })],
    ])("ignores %s", (_, event) => {
        expect(isQuickCaptureShortcut(event)).toBe(false);
    });
});
