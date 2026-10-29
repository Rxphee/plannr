import { describe, expect, it } from "vitest";

import { findIssueNumberIn, parseIssueKey } from "./issue-key.js";

describe("parseIssueKey", () => {
    it("splits a key into project key and number", () => {
        expect(parseIssueKey("WEB-42")).toEqual({ projectKey: "WEB", number: 42 });
    });

    it.each(["web-42", "WEB-0", "WEB-042", "WEB42", "W-1", "WEB-1234567890"])("rejects %j", (key) => {
        expect(parseIssueKey(key)).toBeUndefined();
    });
});

describe("findIssueNumberIn", () => {
    it.each([
        ["42", 42],
        ["WEB-42", 42],
        ["web-7", 7],
    ])("finds the number in %j", (search, number) => {
        expect(findIssueNumberIn(search)).toBe(number);
    });

    it.each(["header", "42 header", "1234567890"])("finds no number in %j", (search) => {
        expect(findIssueNumberIn(search)).toBeUndefined();
    });
});
