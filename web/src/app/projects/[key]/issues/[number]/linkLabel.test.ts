import { describe, expect, it } from "vitest";

import { linkLabel } from "./linkLabel";

describe("linkLabel", () => {
    it.each([
        ["https://github.com/Rxphee/plannr/pull/12", "Rxphee/plannr#12"],
        ["https://github.com/Rxphee/plannr/pull/12/files", "Rxphee/plannr#12"],
        ["https://example.com/docs", "example.com/docs"],
        ["obsidian://open?vault=SecondBrain&file=Plannr", "obsidian://open?vault=SecondBrain&file=Plannr"],
    ])("shows %s as %s", (url, label) => {
        expect(linkLabel({ url })).toBe(label);
    });
});
