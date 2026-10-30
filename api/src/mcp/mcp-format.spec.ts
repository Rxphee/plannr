import { Epic } from "@src/epics/entities/epic.entity.js";
import { Issue, IssuePriority, IssueStatus, IssueType } from "@src/issues/entities/issue.entity.js";
import { IssueLink, IssueLinkKind } from "@src/issues/entities/issue-link.entity.js";
import { Label } from "@src/labels/entities/label.entity.js";
import { ProjectStatus } from "@src/projects/entities/project.entity.js";
import { describe, expect, it } from "vitest";

import { formatEpicLine, formatIssueDetails, formatIssueLine, formatPage, formatProjectLine } from "./mcp-format.js";

function createIssue(data: Partial<Issue> = {}): Issue {
    return Object.assign(
        new Issue(),
        {
            number: 12,
            title: "Navigation collapses too late",
            type: IssueType.bug,
            priority: IssuePriority.high,
            status: IssueStatus.todo,
            createdAt: new Date("2026-10-29T08:00:00Z"),
            updatedAt: new Date("2026-10-30T09:00:00Z"),
        },
        data,
    );
}

describe("formatProjectLine", () => {
    it("shows key, status and name", () => {
        expect(formatProjectLine({ key: "WEB", status: ProjectStatus.active, name: "Website Relaunch" })).toBe("WEB · active · Website Relaunch");
    });
});

describe("formatEpicLine", () => {
    it("shows the progress and the ID and marks the default epic", () => {
        const epic = Object.assign(new Epic(), { id: "6f1c", name: "General", isDefault: true, issueCount: 10, doneIssueCount: 3 });
        expect(formatEpicLine(epic)).toBe("General (default) · 3/10 done · id 6f1c");
    });
});

describe("formatIssueLine", () => {
    it("shows the due date only if there is one", () => {
        expect(formatIssueLine("WEB", createIssue())).toBe("WEB-12 · bug · high · todo · Navigation collapses too late");
        expect(formatIssueLine("WEB", createIssue({ dueDate: "2026-11-03" }))).toBe(
            "WEB-12 · bug · high · todo · due 2026-11-03 · Navigation collapses too late",
        );
    });
});

describe("formatIssueLine with labels", () => {
    it("appends the labels and quotes names with spaces", () => {
        const labels = [Object.assign(new Label(), { name: "needs review" }), Object.assign(new Label(), { name: "upstream" })];
        const issue = createIssue({ labels: { getItems: () => labels } as unknown as Issue["labels"] });

        expect(formatIssueLine("WEB", issue)).toBe('WEB-12 · bug · high · todo · Navigation collapses too late · #"needs review" #upstream');
    });
});

describe("formatIssueDetails", () => {
    it("adds epic, dates, links and the description", () => {
        const links = [
            Object.assign(new IssueLink(), { url: "https://github.com/Rxphee/plannr/pull/12", kind: IssueLinkKind.pullRequest }),
            Object.assign(new IssueLink(), { url: "obsidian://open?vault=SecondBrain", kind: IssueLinkKind.other }),
        ];
        const issue = createIssue({ description: "**Steps**", completedAt: new Date("2026-10-30T10:00:00Z") });

        expect(formatIssueDetails({ projectKey: "WEB", issue, epicName: "Design", links })).toBe(
            [
                "WEB-12 · bug · high · todo · Navigation collapses too late",
                "Epic: Design",
                "Created 2026-10-29, updated 2026-10-30, closed 2026-10-30",
                "Links:",
                "- PR https://github.com/Rxphee/plannr/pull/12",
                "- obsidian://open?vault=SecondBrain",
                "",
                "**Steps**",
            ].join("\n"),
        );
    });

    it("says when there is no description", () => {
        expect(formatIssueDetails({ projectKey: "WEB", issue: createIssue(), epicName: "General", links: [] })).toContain("(no description)");
    });
});

describe("formatPage", () => {
    it("tells the offset of the next page", () => {
        expect(formatPage({ noun: "issues", offset: 25, lines: ["a", "b"], totalCount: 30 })).toBe("Issues 26-27 of 30 (next: offset 27)\na\nb");
    });

    it("leaves out the next offset on the last page", () => {
        expect(formatPage({ noun: "epics", offset: 0, lines: ["a"], totalCount: 1 })).toBe("Epics 1-1 of 1\na");
    });

    it("explains an empty result", () => {
        expect(formatPage({ noun: "issues", offset: 0, lines: [], totalCount: 0 })).toBe("No issues match.");
        expect(formatPage({ noun: "issues", offset: 50, lines: [], totalCount: 30 })).toBe("No issues at offset 50, there are 30.");
    });
});
