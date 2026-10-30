import type { FilterQuery } from "@mikro-orm/postgresql";

import type { Issue } from "./entities/issue.entity.js";

const ISSUE_KEY_PATTERN = /^([A-Z]{2,5})-([1-9]\d{0,8})$/;
// "42" or "WEB-42" in any case. Nine digits at most, so the number fits into an integer column.
const ISSUE_KEY_SEARCH_PATTERN = /^(?:([a-z]{2,5})-)?([1-9]\d{0,8})$/i;

export function parseIssueKey(key: string): { projectKey: string; number: number } | undefined {
    const match = ISSUE_KEY_PATTERN.exec(key);
    if (!match) {
        return undefined;
    }
    const [, projectKey, number] = match;
    return { projectKey, number: Number(number) };
}

// The project key is only there when the search names it
export function findIssueKeyIn(search: string): { projectKey?: string; number: number } | undefined {
    const match = ISSUE_KEY_SEARCH_PATTERN.exec(search);
    if (!match) {
        return undefined;
    }
    const [, projectKey, number] = match;
    return { ...(projectKey && { projectKey: projectKey.toUpperCase() }), number: Number(number) };
}

export function issueKeyCondition({ projectKey, number }: { projectKey?: string; number: number }): FilterQuery<Issue> {
    return projectKey ? { number, project: { key: projectKey } } : { number };
}
