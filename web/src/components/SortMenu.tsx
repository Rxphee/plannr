"use client";

import { Button } from "@src/components/ui/Button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@src/components/ui/DropdownMenu";
import type { GQLSortDirection } from "@src/graphql.generated";
import type { Sort, SortField, SortFieldOption } from "@src/util/sort";
import { ArrowDownWideNarrowIcon, ArrowUpNarrowWideIcon } from "lucide-react";
import { useTranslations } from "next-intl";

interface SortMenuProps<Field extends SortField> {
    fields: SortFieldOption<Field>[];
    sort: Sort<Field>;
    onChange: (sort: Sort<Field>) => void;
}

export function SortMenu<Field extends SortField>({ fields, sort, onChange }: SortMenuProps<Field>) {
    const t = useTranslations("sortMenu");
    // Takes the field as the union of all sort fields, which the translation keys can be checked against
    const labelOf = (field: SortField) => t(`fields.${field}`);
    const kind = fields.find((option) => option.value === sort.field)?.kind ?? "text";
    const fieldLabel = labelOf(sort.field);
    const directionLabel = t(`directions.${kind}.${sort.direction}`);

    const changeField = (field: Field) => {
        const defaultDirection = fields.find((option) => option.value === field)?.defaultDirection ?? "asc";
        onChange({ field, direction: defaultDirection });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button variant="outline" className="gap-2" aria-label={t("triggerLabel", { field: fieldLabel, direction: directionLabel })} />
                }
            >
                {sort.direction === "asc" ? <ArrowUpNarrowWideIcon /> : <ArrowDownWideNarrowIcon />}
                {fieldLabel}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-auto min-w-48">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>{t("sortBy")}</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={sort.field} onValueChange={changeField}>
                        {fields.map((option) => (
                            <DropdownMenuRadioItem key={option.value} value={option.value}>
                                {labelOf(option.value)}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuLabel>{t("order")}</DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={sort.direction} onValueChange={(direction: GQLSortDirection) => onChange({ ...sort, direction })}>
                        {(["asc", "desc"] as const).map((direction) => (
                            <DropdownMenuRadioItem key={direction} value={direction}>
                                {t(`directions.${kind}.${direction}`)}
                            </DropdownMenuRadioItem>
                        ))}
                    </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
