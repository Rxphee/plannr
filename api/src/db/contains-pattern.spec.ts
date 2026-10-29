import { describe, expect, it } from "vitest";

import { containsPattern } from "./contains-pattern.js";

describe("containsPattern", () => {
    it("matches the text anywhere", () => {
        expect(containsPattern("header")).toBe("%header%");
    });

    it("escapes the wildcards and the escape character", () => {
        expect(containsPattern(String.raw`100%_\x`)).toBe(String.raw`%100\%\_\\x%`);
    });
});
