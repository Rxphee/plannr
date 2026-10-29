import { describe, expect, it } from "vitest";

import { issueListHref, parseIssueListParams, toIssueFilter } from "./issueListParams";

const epicId = "0b7f3a52-5c1e-4f0e-9d39-2f4a8e6b1c7d";

describe("parseIssueListParams", () => {
    it("starts with the open issues on the first page", () => {
        expect(parseIssueListParams({})).toEqual({ status: "open", page: 1 });
    });

    it("reads the filters", () => {
        expect(parseIssueListParams({ status: "done", type: "bug", priority: "high", epic: epicId, search: " header ", page: "3" })).toEqual({
            status: "done",
            type: "bug",
            priority: "high",
            epic: epicId,
            search: "header",
            page: 3,
        });
    });

    it("ignores unknown values", () => {
        expect(parseIssueListParams({ status: "blocked", type: "story", priority: "urgent", epic: "42", search: "  ", page: "-2" })).toEqual({
            status: "open",
            page: 1,
        });
    });

    it("takes the first of repeated params", () => {
        expect(parseIssueListParams({ status: ["done", "todo"] }).status).toBe("done");
    });
});

describe("toIssueFilter", () => {
    it("filters the open view by todo and in progress", () => {
        expect(toIssueFilter({ status: "open", page: 1 }).statuses).toEqual(["todo", "inProgress"]);
    });

    it("does not filter the status in the view of all issues", () => {
        expect(toIssueFilter({ status: "all", page: 1 }).statuses).toBeNull();
    });
});

describe("issueListHref", () => {
    it("leaves out the defaults", () => {
        expect(issueListHref("/projects/WEB/issues", { status: "open", page: 1 })).toBe("/projects/WEB/issues");
    });

    it("keeps the filters", () => {
        expect(issueListHref("/projects/WEB/issues", { status: "all", type: "bug", search: "nav bar", page: 2 })).toBe(
            "/projects/WEB/issues?status=all&type=bug&search=nav+bar&page=2",
        );
    });
});
