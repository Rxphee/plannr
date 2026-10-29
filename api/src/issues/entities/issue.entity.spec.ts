import { validateSync } from "class-validator";
import { describe, expect, it } from "vitest";

import { Issue, IssueStatus } from "./issue.entity.js";

function createIssue(data: Partial<Issue> = {}): Issue {
    return Object.assign(new Issue(), { number: 42, title: "Fix the header" }, data);
}

describe("Issue", () => {
    it("accepts a valid issue", () => {
        expect(validateSync(createIssue())).toEqual([]);
    });

    it("accepts a due date", () => {
        expect(validateSync(createIssue({ dueDate: "2026-11-05" }))).toEqual([]);
    });

    it.each([
        ["number", { number: 0 }],
        ["title", { title: "" }],
        ["title", { title: "a".repeat(201) }],
        ["type", { type: "story" as Issue["type"] }],
        ["status", { status: "blocked" as IssueStatus }],
        ["priority", { priority: "urgent" as Issue["priority"] }],
        ["dueDate", { dueDate: "05.11.2026" }],
    ])("rejects an invalid %s", (property, data) => {
        expect(validateSync(createIssue(data)).map((error) => error.property)).toEqual([property]);
    });

    describe("changeStatus", () => {
        it("sets completedAt when the issue is done", () => {
            const issue = createIssue();
            issue.changeStatus(IssueStatus.done);
            expect(issue.completedAt).toBeInstanceOf(Date);
        });

        it("keeps the first completedAt when a done issue is canceled", () => {
            const completedAt = new Date("2026-10-01T10:00:00Z");
            const issue = createIssue({ status: IssueStatus.done, completedAt });
            issue.changeStatus(IssueStatus.canceled);
            expect(issue.completedAt).toBe(completedAt);
        });

        it("clears completedAt when the issue is reopened", () => {
            const issue = createIssue({ status: IssueStatus.done, completedAt: new Date() });
            issue.changeStatus(IssueStatus.inProgress);
            expect(issue.completedAt).toBeNull();
        });

        it("keeps completedAt when the status stays the same", () => {
            const completedAt = new Date("2026-10-01T10:00:00Z");
            const issue = createIssue({ status: IssueStatus.done, completedAt });
            issue.changeStatus(IssueStatus.done);
            expect(issue.completedAt).toBe(completedAt);
        });
    });
});
