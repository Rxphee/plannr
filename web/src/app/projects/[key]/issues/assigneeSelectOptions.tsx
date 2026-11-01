import type { SelectOption } from "@src/components/OptionSelect";
import { CircleDashedIcon, CircleUserRoundIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import type { Assignee } from "./fetchAssigneeOptions";

// Selects need a value for every option, so "unassigned" stands for no assignee
export const UNASSIGNED = "unassigned";

export function toAssigneeId(value: string | undefined): string | null {
    return !value || value === UNASSIGNED ? null : value;
}

// "Unassigned" first, then the people, admins without membership with a hint that they become members
export function useAssigneeSelectOptions(assignees: Assignee[]): SelectOption[] {
    const t = useTranslations("issueFields");

    return [
        { value: UNASSIGNED, label: t("unassigned"), icon: <CircleDashedIcon className="text-muted-foreground size-4" /> },
        ...assignees.map(({ id, firstName, lastName, isMember }) => {
            const name = `${firstName} ${lastName}`;
            return {
                value: id,
                label: isMember ? name : t("joinsAsMember", { name }),
                icon: <CircleUserRoundIcon className="text-muted-foreground size-4" />,
            };
        }),
    ];
}
