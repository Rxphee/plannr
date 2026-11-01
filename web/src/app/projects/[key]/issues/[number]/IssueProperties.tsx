"use client";

import { LabelBadge } from "@src/app/labels/LabelBadge";
import { DatePicker } from "@src/components/DatePicker";
import { OptionSelect } from "@src/components/OptionSelect";
import { UserAvatar } from "@src/components/UserAvatar";
import type { GQLIssuePriority, GQLIssueStatus, GQLIssueType, GQLLabelColor, GQLUpdateIssueInput } from "@src/graphql.generated";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { type ReactNode, useState, useTransition } from "react";

import { updateIssue } from "../actions";
import { AssigneeSelect } from "../AssigneeSelect";
import type { Assignee } from "../fetchAssigneeOptions";
import { IssuePriorityIcon } from "../IssuePriorityIcon";
import { toEpicSelectOptions, useIssueSelectOptions } from "../issueSelectOptions";
import { IssueStatusBadge } from "../IssueStatusBadge";
import { IssueTypeIcon } from "../IssueTypeIcon";
import { IssueLabelsSelect } from "./IssueLabelsSelect";

type Label = { id: string; name: string; color: GQLLabelColor };

interface IssuePropertiesProps {
    issue: {
        id: string;
        status: GQLIssueStatus;
        priority: GQLIssuePriority;
        type: GQLIssueType;
        dueDate: string | null;
        epic: { id: string; name: string };
        assignee: { id: string; firstName: string; lastName: string } | null;
        labels: Label[];
    };
    project: { key: string; name: string; canContribute: boolean; epics: { id: string; name: string }[] };
    // All labels to choose from
    labels: Label[];
    // Everyone the issue can be assigned to, only needed to change it
    assignees: Assignee[];
}

// Each property saves on its own as soon as it changes
export function IssueProperties({ issue, project, labels, assignees }: IssuePropertiesProps) {
    const t = useTranslations("issueFields");
    const tCommon = useTranslations("common");
    const tType = useTranslations("issueType");
    const tPriority = useTranslations("issuePriority");
    const format = useFormatter();
    const { statusOptions, typeOptions, priorityOptions } = useIssueSelectOptions();
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
                <Property label={t("status")}>
                    <IssueStatusBadge status={issue.status} />
                </Property>
                <Property label={t("assignee")}>
                    {issue.assignee ? (
                        <span className="flex min-w-0 items-center gap-2">
                            <UserAvatar user={issue.assignee} size="xs" />
                            <span className="truncate">
                                {issue.assignee.firstName} {issue.assignee.lastName}
                            </span>
                        </span>
                    ) : (
                        t("unassigned")
                    )}
                </Property>
                <Property label={t("priority")}>
                    <span className="flex items-center gap-1.5">
                        <IssuePriorityIcon priority={issue.priority} />
                        {tPriority(issue.priority)}
                    </span>
                </Property>
                <Property label={t("type")}>
                    <span className="flex items-center gap-1.5">
                        <IssueTypeIcon type={issue.type} />
                        {tType(issue.type)}
                    </span>
                </Property>
                <Property label={t("epic")}>
                    <Link
                        href={`/projects/${project.key}/epics/${issue.epic.id}`}
                        className="hover:text-foreground truncate underline-offset-4 hover:underline"
                    >
                        {issue.epic.name}
                    </Link>
                </Property>
                <Property label={t("dueDate")}>{issue.dueDate ? format.dateTime(new Date(issue.dueDate), "day") : tCommon("none")}</Property>
                <Property label={t("labels")}>
                    {issue.labels.length > 0 ? (
                        <span className="flex flex-wrap gap-1">
                            {issue.labels.map((label) => (
                                <LabelBadge key={label.id} label={label} />
                            ))}
                        </span>
                    ) : (
                        tCommon("none")
                    )}
                </Property>
            </dl>
        );
    }

    return (
        <div className="grid gap-3">
            <dl className="grid gap-2 text-sm">
                <Property label={t("status")}>
                    <OptionSelect
                        size="sm"
                        aria-label={t("status")}
                        options={statusOptions}
                        value={issue.status}
                        disabled={pending}
                        onChange={(status) => save({ status })}
                    />
                </Property>
                <Property label={t("assignee")}>
                    <AssigneeSelect
                        size="sm"
                        aria-label={t("assignee")}
                        assignees={assignees}
                        value={issue.assignee?.id ?? null}
                        projectName={project.name}
                        disabled={pending}
                        onChange={(assigneeId) => save({ assigneeId })}
                    />
                </Property>
                <Property label={t("priority")}>
                    <OptionSelect
                        size="sm"
                        aria-label={t("priority")}
                        options={priorityOptions}
                        value={issue.priority}
                        disabled={pending}
                        onChange={(priority) => save({ priority })}
                    />
                </Property>
                <Property label={t("type")}>
                    <OptionSelect
                        size="sm"
                        aria-label={t("type")}
                        options={typeOptions}
                        value={issue.type}
                        disabled={pending}
                        onChange={(type) => save({ type })}
                    />
                </Property>
                <Property label={t("epic")}>
                    <OptionSelect
                        size="sm"
                        aria-label={t("epic")}
                        options={toEpicSelectOptions(project.epics)}
                        value={issue.epic.id}
                        disabled={pending}
                        onChange={(epicId) => save({ epicId })}
                    />
                </Property>
                <Property label={t("dueDate")}>
                    <DatePicker
                        size="sm"
                        aria-label={t("dueDate")}
                        value={issue.dueDate}
                        placeholder={t("noDueDate")}
                        disabled={pending}
                        onChange={(dueDate) => save({ dueDate })}
                    />
                </Property>
                {labels.length > 0 && (
                    <Property label={t("labels")}>
                        <IssueLabelsSelect labels={labels} selected={issue.labels} disabled={pending} onChange={(labelIds) => save({ labelIds })} />
                    </Property>
                )}
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
