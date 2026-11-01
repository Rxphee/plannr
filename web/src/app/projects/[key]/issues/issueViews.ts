import type { GQLIssueStatus, GQLIssueView } from "@src/graphql.generated";

// The views show open issues only, the API decides what belongs to each one
export const OPEN_ISSUE_STATUSES: GQLIssueStatus[] = ["todo", "inProgress"];

// In the order of the tabs; label and empty state of each are under issueViews in the messages
export const ISSUE_VIEWS: GQLIssueView[] = ["focus", "due", "bugs", "pullRequests"];

export function isIssueView(value: unknown): value is GQLIssueView {
    return ISSUE_VIEWS.includes(value as GQLIssueView);
}
