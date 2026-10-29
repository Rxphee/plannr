import { describe, expect, it } from "vitest";

import { suggestProjectKey } from "./suggestProjectKey";

describe("suggestProjectKey", () => {
    it("takes the first letters of a single word", () => {
        expect(suggestProjectKey("Plannr")).toBe("PLAN");
        expect(suggestProjectKey("Atom")).toBe("ATOM");
        expect(suggestProjectKey("Bau")).toBe("BAU");
    });

    it("takes the initials of several words", () => {
        expect(suggestProjectKey("Second Brain")).toBe("SB");
        expect(suggestProjectKey("work-dashboard 2")).toBe("WD");
    });

    it("limits the key to five letters", () => {
        expect(suggestProjectKey("one two three four five six")).toBe("OTTFF");
    });

    it("removes diacritics", () => {
        expect(suggestProjectKey("Überblick")).toBe("UBER");
    });

    it("returns an empty key if no two letters can be derived", () => {
        expect(suggestProjectKey("")).toBe("");
        expect(suggestProjectKey("X")).toBe("");
        expect(suggestProjectKey("2026")).toBe("");
    });
});
