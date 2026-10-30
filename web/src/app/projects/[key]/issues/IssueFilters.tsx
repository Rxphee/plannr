"use client";

import { FilterMenu } from "@src/components/FilterMenu";
import { ResetButton } from "@src/components/ResetButton";
import { SearchInput } from "@src/components/SearchInput";
import { useDebouncedSearch } from "@src/hooks/useDebouncedSearch";
import { cn } from "@src/lib/utils";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { isIssueListFiltered, issueListHref, type IssueListParams, parseIssueListParams } from "./issueListParams";
import { issuePrioritySelectOptions, issueStatusSelectOptions, issueTypeSelectOptions, toEpicSelectOptions } from "./issueSelectOptions";
import { OPEN_ISSUE_STATUSES } from "./issueViews";

// A view shows open issues only
const openIssueStatusSelectOptions = issueStatusSelectOptions.filter((option) => OPEN_ISSUE_STATUSES.includes(option.value));

interface IssueFiltersProps {
    path: string;
    params: IssueListParams;
    // Without epics the epic filter is hidden, e.g. on the page of an epic
    epics?: { id: string; name: string }[];
}

export function IssueFilters({ path, params, epics }: IssueFiltersProps) {
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
                placeholder="Search title or key"
                label="Search issues"
            />
            <FilterMenu
                label="Status"
                options={params.view ? openIssueStatusSelectOptions : issueStatusSelectOptions}
                selected={params.statuses}
                onChange={(statuses) => applyFilter({ statuses })}
            />
            <FilterMenu label="Type" options={issueTypeSelectOptions} selected={params.types} onChange={(types) => applyFilter({ types })} />
            <FilterMenu
                label="Priority"
                options={issuePrioritySelectOptions}
                selected={params.priorities}
                onChange={(priorities) => applyFilter({ priorities })}
            />
            {epics && (
                <FilterMenu
                    label="Epic"
                    options={toEpicSelectOptions(epics)}
                    selected={params.epics}
                    onChange={(selected) => applyFilter({ epics: selected })}
                />
            )}
            {isIssueListFiltered({ ...params, page: 1 }) && <ResetButton onClick={reset} />}
        </div>
    );
}
