import { describe, expect, it } from "vitest";

import { findIssueKeyIn, parseIssueKey } from "./issue-key.js";

describe("parseIssueKey", () => {
    it("splits a key into project key and number", () => {
        expect(parseIssueKey("WEB-42")).toEqual({ projectKey: "WEB", number: 42 });
    });

    it.each(["web-42", "WEB-0", "WEB-042", "WEB42", "W-1", "WEB-1234567890"])("rejects %j", (key) => {
        expect(parseIssueKey(key)).toBeUndefined();
    });
});

describe("findIssueKeyIn", () => {
    it.each([
        ["42", { number: 42 }],
        ["WEB-42", { projectKey: "WEB", number: 42 }],
        ["web-7", { projectKey: "WEB", number: 7 }],
    ])("finds the key in %j", (search, issueKey) => {
        expect(findIssueKeyIn(search)).toEqual(issueKey);
    });

    it.each(["header", "42 header", "1234567890", "W-42"])("finds no key in %j", (search) => {
        expect(findIssueKeyIn(search)).toBeUndefined();
    });
});
