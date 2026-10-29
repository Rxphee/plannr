import type { GQLIssuePriority, GQLIssueStatus, GQLIssueType } from "@src/graphql.generated";

export const ISSUE_TITLE_MAX_LENGTH = 200;

export const issueStatusOptions: { value: GQLIssueStatus; label: string }[] = [
    { value: "todo", label: "Todo" },
    { value: "inProgress", label: "In progress" },
    { value: "done", label: "Done" },
    { value: "canceled", label: "Canceled" },
];

export const issueTypeOptions: { value: GQLIssueType; label: string }[] = [
    { value: "task", label: "Task" },
    { value: "bug", label: "Bug" },
];

export const issuePriorityOptions: { value: GQLIssuePriority; label: string }[] = [
    { value: "high", label: "High" },
    { value: "normal", label: "Normal" },
    { value: "low", label: "Low" },
];

function toLabels<Value extends string>(options: { value: Value; label: string }[]): Record<Value, string> {
    return Object.fromEntries(options.map(({ value, label }) => [value, label])) as Record<Value, string>;
}

export const issueStatusLabels = toLabels(issueStatusOptions);
export const issueTypeLabels = toLabels(issueTypeOptions);
export const issuePriorityLabels = toLabels(issuePriorityOptions);
