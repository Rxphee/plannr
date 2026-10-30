import type { Epic } from "@src/epics/entities/epic.entity.js";
import type { Issue } from "@src/issues/entities/issue.entity.js";
import { type IssueLink, IssueLinkKind } from "@src/issues/entities/issue-link.entity.js";
import type { Project } from "@src/projects/entities/project.entity.js";

// Tool answers are short lines instead of JSON, so an answer costs a few hundred tokens

const SEPARATOR = " · ";

export function formatProjectLine({ key, status, name }: Pick<Project, "key" | "status" | "name">): string {
    return [key, status, name].join(SEPARATOR);
}

export function formatEpicLine({ id, name, isDefault, issueCount, doneIssueCount }: Epic): string {
    return [name + (isDefault ? " (default)" : ""), `${doneIssueCount}/${issueCount} done`, `id ${id}`].join(SEPARATOR);
}

// The labels must be loaded
export function formatIssueLine(projectKey: string, { number, type, priority, status, dueDate, title, labels }: Issue): string {
    // By name like the API, also for an issue that was just created with its labels in another order
    const labelNames = labels
        .getItems()
        .map(({ name }) => name)
        .sort((first, second) => first.localeCompare(second))
        .map(formatLabel);
    return [
        `${projectKey}-${number}`,
        type,
        priority,
        status,
        ...(dueDate ? [`due ${dueDate}`] : []),
        title,
        ...(labelNames.length > 0 ? [labelNames.join(" ")] : []),
    ].join(SEPARATOR);
}

// #upstream, or #"needs review" for a name with spaces, so the names stay apart
function formatLabel(name: string): string {
    return /\s/.test(name) ? `#"${name}"` : `#${name}`;
}

interface IssueDetails {
    projectKey: string;
    issue: Issue;
    epicName: string;
    links: IssueLink[];
}

export function formatIssueDetails({ projectKey, issue, epicName, links }: IssueDetails): string {
    const lines = [
        formatIssueLine(projectKey, issue),
        `Epic: ${epicName}`,
        `Created ${formatDay(issue.createdAt)}, updated ${formatDay(issue.updatedAt)}${issue.completedAt ? `, closed ${formatDay(issue.completedAt)}` : ""}`,
    ];
    if (links.length > 0) {
        lines.push("Links:", ...links.map(({ kind, url }) => `- ${kind === IssueLinkKind.pullRequest ? "PR " : ""}${url}`));
    }
    lines.push("", issue.description || "(no description)");
    return lines.join("\n");
}

interface Page {
    // Plural, e.g. "issues"
    noun: string;
    offset: number;
    lines: string[];
    totalCount: number;
}

// The lines of one page with a header that tells how to get the next one
export function formatPage({ noun, offset, lines, totalCount }: Page): string {
    if (totalCount === 0) {
        return `No ${noun} match.`;
    }
    if (lines.length === 0) {
        return `No ${noun} at offset ${offset}, there are ${totalCount}.`;
    }
    const end = offset + lines.length;
    const header = `${noun[0].toUpperCase()}${noun.slice(1)} ${offset + 1}-${end} of ${totalCount}${end < totalCount ? ` (next: offset ${end})` : ""}`;
    return [header, ...lines].join("\n");
}

function formatDay(date: Date): string {
    return date.toISOString().slice(0, 10);
}
