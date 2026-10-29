import type { GQLIssuePriority, GQLIssueStatus, GQLIssueType } from "@src/graphql.generated";
import { cn } from "@src/lib/utils";
import { CalendarIcon, GitPullRequestIcon } from "lucide-react";
import Link from "next/link";

import { formatDueDate, isOverdue } from "./dueDate";
import { IssuePriorityIcon } from "./IssuePriorityIcon";
import { IssueStatusBadge, IssueStatusDot } from "./IssueStatusBadge";
import { IssueTypeIcon } from "./IssueTypeIcon";

interface IssueListProps {
    projectKey: string;
    issues: {
        id: string;
        key: string;
        number: number;
        title: string;
        type: GQLIssueType;
        status: GQLIssueStatus;
        priority: GQLIssuePriority;
        dueDate: string | null;
        epic: { name: string };
        links: { kind: string }[];
    }[];
    // Hidden on the page of an epic, where all issues share it
    hideEpic?: boolean;
}

export function IssueList({ projectKey, issues, hideEpic }: IssueListProps) {
    return (
        <ul className="bg-card ring-foreground/10 divide-y overflow-hidden rounded-xl shadow-xs ring-1">
            {issues.map((issue) => {
                const hasPullRequest = issue.links.some((link) => link.kind === "pullRequest");
                const isClosed = issue.status === "done" || issue.status === "canceled";

                return (
                    <li key={issue.id}>
                        <Link
                            href={`/projects/${projectKey}/issues/${issue.number}`}
                            className="hover:bg-muted/60 focus-visible:bg-muted/60 flex items-center gap-3 px-4 py-2.5 transition-colors outline-none"
                        >
                            <IssuePriorityIcon priority={issue.priority} />
                            <span className="text-muted-foreground w-16 shrink-0 font-mono text-sm">{issue.key}</span>
                            <IssueTypeIcon type={issue.type} />
                            <span className={cn("line-clamp-2 min-w-0 flex-1 sm:truncate", isClosed && "text-muted-foreground")}>{issue.title}</span>
                            {hasPullRequest && (
                                <GitPullRequestIcon role="img" aria-label="Pull request" className="text-muted-foreground size-4 shrink-0" />
                            )}
                            {!hideEpic && (
                                <span className="text-muted-foreground hidden max-w-40 shrink-0 truncate rounded-md border px-2 text-xs leading-5 md:inline">
                                    {issue.epic.name}
                                </span>
                            )}
                            {issue.dueDate && (
                                <span
                                    className={cn(
                                        "text-muted-foreground hidden shrink-0 items-center gap-1 text-sm sm:flex",
                                        isOverdue(issue.dueDate, issue.status) && "font-medium text-orange-600 dark:text-orange-400",
                                    )}
                                >
                                    <CalendarIcon className="size-3.5" />
                                    {formatDueDate(issue.dueDate)}
                                </span>
                            )}
                            <IssueStatusDot status={issue.status} className="sm:hidden" />
                            {/* As wide as the widest status, so the columns before it line up */}
                            <span className="hidden w-28 shrink-0 justify-end sm:flex">
                                <IssueStatusBadge status={issue.status} />
                            </span>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}
