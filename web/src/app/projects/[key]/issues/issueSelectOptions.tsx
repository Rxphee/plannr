import type { SelectOption } from "@src/components/OptionSelect";
import type { GQLIssuePriority, GQLIssueStatus, GQLIssueType } from "@src/graphql.generated";
import { LayersIcon } from "lucide-react";

import { issuePriorityOptions, issueStatusOptions, issueTypeOptions } from "./issueOptions";
import { IssuePriorityIcon } from "./IssuePriorityIcon";
import { IssueStatusDot } from "./IssueStatusBadge";
import { IssueTypeIcon } from "./IssueTypeIcon";

// The options of the issue selects and filters, with the icons the issue list uses
export const issueStatusSelectOptions: SelectOption<GQLIssueStatus>[] = issueStatusOptions.map((option) => ({
    ...option,
    icon: <IssueStatusDot status={option.value} />,
}));

export const issueTypeSelectOptions: SelectOption<GQLIssueType>[] = issueTypeOptions.map((option) => ({
    ...option,
    icon: <IssueTypeIcon type={option.value} />,
}));

export const issuePrioritySelectOptions: SelectOption<GQLIssuePriority>[] = issuePriorityOptions.map((option) => ({
    ...option,
    icon: <IssuePriorityIcon priority={option.value} />,
}));

export function toEpicSelectOptions(epics: { id: string; name: string }[]): SelectOption[] {
    return epics.map((epic) => ({ value: epic.id, label: epic.name, icon: <LayersIcon className="text-muted-foreground size-4" /> }));
}
