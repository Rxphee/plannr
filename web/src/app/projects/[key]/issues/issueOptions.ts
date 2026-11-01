import type { GQLIssuePriority, GQLIssueStatus, GQLIssueType } from "@src/graphql.generated";

export const ISSUE_TITLE_MAX_LENGTH = 200;

// In the order the selects and filters offer them
export const ISSUE_STATUSES: GQLIssueStatus[] = ["todo", "inProgress", "done", "canceled"];

export const ISSUE_TYPES: GQLIssueType[] = ["task", "bug"];

export const ISSUE_PRIORITIES: GQLIssuePriority[] = ["high", "normal", "low"];
