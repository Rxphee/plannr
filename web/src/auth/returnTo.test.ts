import { describe, expect, it } from "vitest";

import { parseReturnTo } from "./returnTo";

describe("parseReturnTo", () => {
    it("keeps a path of the app with its search params", () => {
        expect(parseReturnTo("/projects/WEB/issues?status=all")).toBe("/projects/WEB/issues?status=all");
    });

    it.each([null, "", "projects", "https://evil.example.com", "//evil.example.com", "/\\evil.example.com", "/auth/callback"])(
        "falls back to the start page for %s",
        (value) => {
            expect(parseReturnTo(value)).toBe("/");
        },
    );
});
