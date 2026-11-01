import { describe, expect, it } from "vitest";

import { hueFor } from "./hueFor";

describe("hueFor", () => {
    it("returns the same hue for the same value", () => {
        expect(hueFor("OASIS")).toBe(hueFor("OASIS"));
    });

    it("spreads different values over different hues", () => {
        const hues = new Set(["OASIS", "MOVE", "WEB", "APP", "HOME"].map(hueFor));
        expect(hues.size).toBeGreaterThan(1);
    });
});
