"use client";

import { Input } from "@src/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@src/components/ui/Select";
import type { GQLIssuePriority, GQLIssueStatus, GQLIssueType, GQLUpdateIssueInput } from "@src/graphql.generated";
import Link from "next/link";
import { type ReactNode, useState, useTransition } from "react";

import { updateIssue } from "../actions";
import { formatDueDate } from "../dueDate";
import { issuePriorityLabels, issuePriorityOptions, issueStatusOptions, issueTypeLabels, issueTypeOptions } from "../issueOptions";
import { IssuePriorityIcon } from "../IssuePriorityIcon";
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

    const epicLink = (
        <Link href={`/projects/${project.key}/epics/${issue.epic.id}`} className="hover:text-foreground truncate underline-offset-4 hover:underline">
            {issue.epic.name}
        </Link>
    );

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
                <Property label="Epic">{epicLink}</Property>
                <Property label="Due date">{issue.dueDate ? formatDueDate(issue.dueDate) : "None"}</Property>
            </dl>
        );
    }

    return (
        <div className="grid gap-3">
            <dl className="grid gap-3 text-sm">
                <Property label="Status">
                    <PropertySelect
                        label="Status"
                        value={issue.status}
                        options={issueStatusOptions}
                        disabled={pending}
                        onChange={(status) => save({ status })}
                    />
                </Property>
                <Property label="Priority">
                    <PropertySelect
                        label="Priority"
                        value={issue.priority}
                        options={issuePriorityOptions}
                        disabled={pending}
                        onChange={(priority) => save({ priority })}
                    />
                </Property>
                <Property label="Type">
                    <PropertySelect
                        label="Type"
                        value={issue.type}
                        options={issueTypeOptions}
                        disabled={pending}
                        onChange={(type) => save({ type })}
                    />
                </Property>
                <Property label="Epic">
                    <PropertySelect
                        label="Epic"
                        value={issue.epic.id}
                        options={project.epics.map((epic) => ({ value: epic.id, label: epic.name }))}
                        disabled={pending}
                        onChange={(epicId) => save({ epicId })}
                    />
                </Property>
                <Property label="Due date">
                    <Input
                        type="date"
                        // Remounts when the saved date changes, so the field shows what was saved
                        key={issue.dueDate}
                        defaultValue={issue.dueDate ?? ""}
                        disabled={pending}
                        aria-label="Due date"
                        className="h-8"
                        onBlur={(event) => {
                            const dueDate = event.target.value || null;
                            if (dueDate !== issue.dueDate) {
                                save({ dueDate });
                            }
                        }}
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
        <div className="grid grid-cols-[6rem_1fr] items-center gap-2">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="flex min-w-0">{children}</dd>
        </div>
    );
}

interface PropertySelectProps<Value extends string> {
    label: string;
    value: Value;
    options: { value: Value; label: string }[];
    disabled: boolean;
    onChange: (value: Value) => void;
}

function PropertySelect<Value extends string>({ label, value, options, disabled, onChange }: PropertySelectProps<Value>) {
    return (
        <Select
            items={options}
            value={value}
            disabled={disabled}
            onValueChange={(newValue) => {
                if (newValue && newValue !== value) {
                    onChange(newValue);
                }
            }}
        >
            <SelectTrigger size="sm" className="w-full" aria-label={label}>
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                        {option.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
