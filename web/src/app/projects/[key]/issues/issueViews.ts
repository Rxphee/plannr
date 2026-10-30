import type { GQLIssueStatus, GQLIssueView } from "@src/graphql.generated";

// The views show open issues only, the API decides what belongs to each one
export const OPEN_ISSUE_STATUSES: GQLIssueStatus[] = ["todo", "inProgress"];

export const issueViews: Record<GQLIssueView, { label: string; emptyTitle: string; emptyDescription: string }> = {
    focus: {
        label: "Focus",
        emptyTitle: "Nothing in focus",
        emptyDescription: "Open issues with priority high show up here.",
    },
    due: {
        label: "Due",
        emptyTitle: "Nothing due",
        emptyDescription: "Open issues with a due date show up here, the soonest first.",
    },
    bugs: {
        label: "Bugs",
        emptyTitle: "No open bugs",
        emptyDescription: "Open issues of the type bug show up here.",
    },
    pullRequests: {
        label: "Open PRs",
        emptyTitle: "No open pull requests",
        emptyDescription: "Open issues with a link to a pull request on GitHub show up here.",
    },
};

export function isIssueView(value: unknown): value is GQLIssueView {
    return typeof value === "string" && Object.hasOwn(issueViews, value);
}
