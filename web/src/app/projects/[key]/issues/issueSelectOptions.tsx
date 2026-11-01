import type { SelectOption } from "@src/components/OptionSelect";
import type { GQLIssuePriority, GQLIssueStatus, GQLIssueType } from "@src/graphql.generated";
import { LayersIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import { ISSUE_PRIORITIES, ISSUE_STATUSES, ISSUE_TYPES } from "./issueOptions";
import { IssuePriorityIcon } from "./IssuePriorityIcon";
import { IssueStatusDot } from "./IssueStatusBadge";
import { IssueTypeIcon } from "./IssueTypeIcon";

interface IssueSelectOptions {
    statusOptions: SelectOption<GQLIssueStatus>[];
    typeOptions: SelectOption<GQLIssueType>[];
    priorityOptions: SelectOption<GQLIssuePriority>[];
}

// The options of the issue selects and filters, with the icons the issue list uses
export function useIssueSelectOptions(): IssueSelectOptions {
    const tStatus = useTranslations("issueStatus");
    const tType = useTranslations("issueType");
    const tPriority = useTranslations("issuePriority");

    return {
        statusOptions: ISSUE_STATUSES.map((status) => ({ value: status, label: tStatus(status), icon: <IssueStatusDot status={status} /> })),
        typeOptions: ISSUE_TYPES.map((type) => ({ value: type, label: tType(type), icon: <IssueTypeIcon type={type} /> })),
        priorityOptions: ISSUE_PRIORITIES.map((priority) => ({
            value: priority,
            label: tPriority(priority),
            icon: <IssuePriorityIcon priority={priority} />,
        })),
    };
}

export function toEpicSelectOptions(epics: { id: string; name: string }[]): SelectOption[] {
    return epics.map((epic) => ({ value: epic.id, label: epic.name, icon: <LayersIcon className="text-muted-foreground size-4" /> }));
}
