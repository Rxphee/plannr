"use client";

import { LabelBadge, LabelColorDot } from "@src/app/labels/LabelBadge";
import { Button } from "@src/components/ui/Button";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@src/components/ui/DropdownMenu";
import type { GQLLabelColor } from "@src/graphql.generated";

type Label = { id: string; name: string; color: GQLLabelColor };

interface IssueLabelsSelectProps {
    labels: Label[];
    selected: Label[];
    disabled?: boolean;
    // Gets all labels the issue has after the change, in the order of the labels
    onChange: (labelIds: string[]) => void;
}

// The labels of an issue as badges, with a menu that stays open to check several of them
export function IssueLabelsSelect({ labels, selected, disabled, onChange }: IssueLabelsSelectProps) {
    const selectedIds = new Set(selected.map(({ id }) => id));

    const toggle = (labelId: string, isChecked: boolean) => {
        onChange(labels.map(({ id }) => id).filter((id) => (id === labelId ? isChecked : selectedIds.has(id))));
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button variant="outline" size="sm" aria-label="Labels" className="h-auto min-h-8 w-full flex-wrap justify-start gap-1 py-1" />
                }
            >
                {selected.length > 0 ? (
                    selected.map((label) => <LabelBadge key={label.id} label={label} />)
                ) : (
                    <span className="text-muted-foreground font-normal">No labels</span>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-auto min-w-52">
                {labels.map((label) => (
                    <DropdownMenuCheckboxItem
                        key={label.id}
                        checked={selectedIds.has(label.id)}
                        disabled={disabled}
                        closeOnClick={false}
                        onCheckedChange={(isChecked) => toggle(label.id, isChecked)}
                    >
                        <LabelColorDot color={label.color} />
                        <span className="truncate">{label.name}</span>
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
