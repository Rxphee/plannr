"use client";

import { toLabelSelectOptions } from "@src/app/labels/labelSelectOptions";
import { FilterMenu } from "@src/components/FilterMenu";
import { ResetButton } from "@src/components/ResetButton";
import { SearchInput } from "@src/components/SearchInput";
import type { GQLLabelColor } from "@src/graphql.generated";
import { useDebouncedSearch } from "@src/hooks/useDebouncedSearch";
import { cn } from "@src/lib/utils";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useTransition } from "react";

import { isIssueListFiltered, issueListHref, type IssueListParams, parseIssueListParams } from "./issueListParams";
import { toEpicSelectOptions, useIssueSelectOptions } from "./issueSelectOptions";
import { OPEN_ISSUE_STATUSES } from "./issueViews";

interface IssueFiltersProps {
    path: string;
    params: IssueListParams;
    // Without epics the epic filter is hidden, e.g. on the page of an epic
    epics?: { id: string; name: string }[];
    // Without labels the label filter is hidden
    labels: { id: string; name: string; color: GQLLabelColor }[];
}

export function IssueFilters({ path, params, epics, labels }: IssueFiltersProps) {
    const t = useTranslations("issues");
    const tFields = useTranslations("issueFields");
    const { statusOptions, typeOptions, priorityOptions } = useIssueSelectOptions();
    // A view shows open issues only
    const openStatusOptions = statusOptions.filter((option) => OPEN_ISSUE_STATUSES.includes(option.value));
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const navigate = (nextParams: IssueListParams) => {
        startTransition(() => {
            router.replace(issueListHref(path, nextParams), { scroll: false });
        });
    };

    // Every filter change starts again on the first page
    const applyFilter = (change: Partial<IssueListParams>) => navigate({ ...params, ...change, page: 1 });

    const { search, changeSearch, clearSearch } = useDebouncedSearch(params.search ?? "", (nextSearch) => applyFilter({ search: nextSearch }));

    const reset = () => {
        clearSearch();
        // Keeps the view and the page size, they are no filters
        navigate({ ...parseIssueListParams({}), view: params.view, pageSize: params.pageSize });
    };

    return (
        <div className={cn("flex flex-wrap items-center gap-2 transition-opacity duration-100", pending && "opacity-60")}>
            <SearchInput
                value={search}
                onChange={changeSearch}
                onClear={() => {
                    clearSearch();
                    applyFilter({ search: undefined });
                }}
                placeholder={t("searchPlaceholder")}
                label={t("searchLabel")}
            />
            <FilterMenu
                label={tFields("status")}
                options={params.view ? openStatusOptions : statusOptions}
                selected={params.statuses}
                onChange={(statuses) => applyFilter({ statuses })}
            />
            <FilterMenu label={tFields("type")} options={typeOptions} selected={params.types} onChange={(types) => applyFilter({ types })} />
            <FilterMenu
                label={tFields("priority")}
                options={priorityOptions}
                selected={params.priorities}
                onChange={(priorities) => applyFilter({ priorities })}
            />
            {epics && (
                <FilterMenu
                    label={tFields("epic")}
                    options={toEpicSelectOptions(epics)}
                    selected={params.epics}
                    onChange={(selected) => applyFilter({ epics: selected })}
                />
            )}
            {labels.length > 0 && (
                <FilterMenu
                    label={tFields("label")}
                    options={toLabelSelectOptions(labels)}
                    selected={params.labels}
                    onChange={(selected) => applyFilter({ labels: selected })}
                />
            )}
            {isIssueListFiltered({ ...params, page: 1 }) && <ResetButton onClick={reset} />}
        </div>
    );
}
