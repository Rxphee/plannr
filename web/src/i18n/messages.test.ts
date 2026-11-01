import de from "@src/../messages/de.json";
import en from "@src/../messages/en.json";
import { describe, expect, it } from "vitest";

// The keys of all nested messages, like "issueStatus.todo"
function messageKeys(messages: object, prefix = ""): string[] {
    return Object.entries(messages).flatMap(([key, value]) =>
        typeof value === "object" && value !== null ? messageKeys(value, `${prefix}${key}.`) : [`${prefix}${key}`],
    );
}

describe("messages", () => {
    // English is the source the types are built from, so every other language must have the same keys
    it("has the same keys in German as in English", () => {
        expect(messageKeys(de).sort()).toEqual(messageKeys(en).sort());
    });
});
