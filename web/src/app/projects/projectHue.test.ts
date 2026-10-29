import { describe, expect, it } from "vitest";

import { projectHue } from "./projectHue";

describe("projectHue", () => {
    it("returns the same hue for the same key", () => {
        expect(projectHue("OASIS")).toBe(projectHue("OASIS"));
    });

    it("spreads different keys over different hues", () => {
        const hues = new Set(["OASIS", "MOVE", "WEB", "APP", "HOME"].map(projectHue));
        expect(hues.size).toBeGreaterThan(1);
    });
});
