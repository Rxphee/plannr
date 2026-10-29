"use client";

import { DatePicker } from "@src/components/DatePicker";
import { OptionSelect } from "@src/components/OptionSelect";
import type { GQLIssuePriority, GQLIssueStatus, GQLIssueType, GQLUpdateIssueInput } from "@src/graphql.generated";
import Link from "next/link";
import { type ReactNode, useState, useTransition } from "react";

import { updateIssue } from "../actions";
import { formatDueDate } from "../dueDate";
import { issuePriorityLabels, issueTypeLabels } from "../issueOptions";
import { IssuePriorityIcon } from "../IssuePriorityIcon";
import { issuePrioritySelectOptions, issueStatusSelectOptions, issueTypeSelectOptions, toEpicSelectOptions } from "../issueSelectOptions";
import { IssueStatusBadge } from "../IssueStatusBadge";
import { IssueTypeIcon } from "../IssueTypeIcon";

interface IssuePropertiesProps {
    issue: {
        id: string;
        status: GQLIssueStatus;
        priority: GQLIssuePriority;
        type: GQLIssueType;
        dueDate: string | null;
        epic: { id: string; name: string };
    };
    project: { key: string; canContribute: boolean; epics: { id: string; name: string }[] };
}

// Each property saves on its own as soon as it changes
export function IssueProperties({ issue, project }: IssuePropertiesProps) {
    const [error, setError] = useState<string>();
    const [pending, startTransition] = useTransition();

    const save = (input: GQLUpdateIssueInput) => {
        startTransition(async () => {
            const result = await updateIssue(issue.id, input);
            setError(result.error);
        });
    };

    if (!project.canContribute) {
        return (
            <dl className="grid gap-3 text-sm">
                <Property label="Status">
                    <IssueStatusBadge status={issue.status} />
                </Property>
                <Property label="Priority">
                    <span className="flex items-center gap-1.5">
                        <IssuePriorityIcon priority={issue.priority} />
                        {issuePriorityLabels[issue.priority]}
                    </span>
                </Property>
                <Property label="Type">
                    <span className="flex items-center gap-1.5">
                        <IssueTypeIcon type={issue.type} />
                        {issueTypeLabels[issue.type]}
                    </span>
                </Property>
                <Property label="Epic">
                    <Link
                        href={`/projects/${project.key}/epics/${issue.epic.id}`}
                        className="hover:text-foreground truncate underline-offset-4 hover:underline"
                    >
                        {issue.epic.name}
                    </Link>
                </Property>
                <Property label="Due date">{issue.dueDate ? formatDueDate(issue.dueDate) : "None"}</Property>
            </dl>
        );
    }

    return (
        <div className="grid gap-3">
            <dl className="grid gap-2 text-sm">
                <Property label="Status">
                    <OptionSelect
                        size="sm"
                        aria-label="Status"
                        options={issueStatusSelectOptions}
                        value={issue.status}
                        disabled={pending}
                        onChange={(status) => save({ status })}
                    />
                </Property>
                <Property label="Priority">
                    <OptionSelect
                        size="sm"
                        aria-label="Priority"
                        options={issuePrioritySelectOptions}
                        value={issue.priority}
                        disabled={pending}
                        onChange={(priority) => save({ priority })}
                    />
                </Property>
                <Property label="Type">
                    <OptionSelect
                        size="sm"
                        aria-label="Type"
                        options={issueTypeSelectOptions}
                        value={issue.type}
                        disabled={pending}
                        onChange={(type) => save({ type })}
                    />
                </Property>
                <Property label="Epic">
                    <OptionSelect
                        size="sm"
                        aria-label="Epic"
                        options={toEpicSelectOptions(project.epics)}
                        value={issue.epic.id}
                        disabled={pending}
                        onChange={(epicId) => save({ epicId })}
                    />
                </Property>
                <Property label="Due date">
                    <DatePicker
                        size="sm"
                        aria-label="Due date"
                        value={issue.dueDate}
                        placeholder="No due date"
                        disabled={pending}
                        onChange={(dueDate) => save({ dueDate })}
                    />
                </Property>
            </dl>
            {error && (
                <p className="text-destructive text-sm" aria-live="polite">
                    {error}
                </p>
            )}
        </div>
    );
}

function Property({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="grid grid-cols-[6rem_minmax(0,1fr)] items-center gap-2">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="flex min-w-0">{children}</dd>
        </div>
    );
}
