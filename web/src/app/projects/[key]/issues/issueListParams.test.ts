import { describe, expect, it } from "vitest";

import { isIssueListFiltered, issueListHref, type IssueListParams, parseIssueListParams, toIssueFilter } from "./issueListParams";

const epicId = "0b7f3a52-5c1e-4f0e-9d39-2f4a8e6b1c7d";
const otherEpicId = "6e2d9c41-8a3b-4b7f-a1e5-3c9d7f2b8e60";
const openIssues: IssueListParams = {
    statuses: ["todo", "inProgress"],
    types: [],
    priorities: [],
    epics: [],
    page: 1,
    pageSize: 25,
    defaultPageSize: 25,
};

describe("parseIssueListParams", () => {
    it("starts with the open issues on the first page", () => {
        expect(parseIssueListParams({})).toEqual(openIssues);
    });

    it("reads several values per filter", () => {
        expect(
            parseIssueListParams({
                status: "done,todo",
                type: "bug",
                priority: "high,low",
                epic: `${epicId},${otherEpicId}`,
                search: " header ",
                page: "3",
                size: "50",
            }),
        ).toEqual({
            statuses: ["todo", "done"],
            types: ["bug"],
            priorities: ["high", "low"],
            epics: [epicId, otherEpicId],
            search: "header",
            page: 3,
            pageSize: 50,
            defaultPageSize: 25,
        });
    });

    it("reads all statuses as no status filter", () => {
        expect(parseIssueListParams({ status: "all" }).statuses).toEqual([]);
    });

    it("ignores unknown values", () => {
        expect(
            parseIssueListParams({ status: "blocked", type: "story,bug", priority: "urgent", epic: "42", search: "  ", page: "-2", size: "30" }),
        ).toEqual({
            ...openIssues,
            types: ["bug"],
        });
    });
});

describe("isIssueListFiltered", () => {
    it("is not filtered for the open issues", () => {
        expect(isIssueListFiltered(openIssues)).toBe(false);
    });

    it.each<[string, Partial<IssueListParams>]>([
        ["other statuses", { statuses: ["done"] }],
        ["all statuses", { statuses: [] }],
        ["a type", { types: ["bug"] }],
        ["a search", { search: "header" }],
        ["a later page", { page: 2 }],
    ])("is filtered with %s", (_, change) => {
        expect(isIssueListFiltered({ ...openIssues, ...change })).toBe(true);
    });

    it("is not filtered with another page size", () => {
        expect(isIssueListFiltered({ ...openIssues, pageSize: 100 })).toBe(false);
    });
});

describe("toIssueFilter", () => {
    it("filters only the lists with values", () => {
        expect(toIssueFilter({ ...openIssues, statuses: [], priorities: ["high"] })).toEqual({
            statuses: null,
            types: null,
            priorities: ["high"],
            epicIds: null,
            search: null,
        });
    });
});

describe("issueListHref", () => {
    it("leaves out the defaults", () => {
        expect(issueListHref("/projects/WEB/issues", openIssues)).toBe("/projects/WEB/issues");
    });

    it("keeps a page size other than the default", () => {
        expect(issueListHref("/projects/WEB/issues", { ...openIssues, pageSize: 50 })).toBe("/projects/WEB/issues?size=50");
    });

    it("keeps the filters", () => {
        expect(issueListHref("/projects/WEB/issues", { ...openIssues, statuses: [], types: ["task", "bug"], search: "nav bar", page: 2 })).toBe(
            "/projects/WEB/issues?status=all&type=task,bug&search=nav+bar&page=2",
        );
    });

    it("reads back what it writes", () => {
        const params: IssueListParams = {
            statuses: ["done"],
            types: ["bug"],
            priorities: ["high", "low"],
            epics: [epicId],
            search: "a,b",
            page: 2,
            pageSize: 100,
            defaultPageSize: 25,
        };
        const query = new URL(issueListHref("/issues", params), "http://localhost").searchParams;
        expect(parseIssueListParams(Object.fromEntries(query))).toEqual(params);
    });
});
