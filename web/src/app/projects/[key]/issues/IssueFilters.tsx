"use client";

import { FilterMenu } from "@src/components/FilterMenu";
import { Button } from "@src/components/ui/Button";
import { Input } from "@src/components/ui/Input";
import { cn } from "@src/lib/utils";
import { SearchIcon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { isIssueListFiltered, issueListHref, type IssueListParams, parseIssueListParams } from "./issueListParams";
import { issuePrioritySelectOptions, issueStatusSelectOptions, issueTypeSelectOptions, toEpicSelectOptions } from "./issueSelectOptions";

const SEARCH_DELAY_MS = 300;

interface IssueFiltersProps {
    path: string;
    params: IssueListParams;
    // Without epics the epic filter is hidden, e.g. on the page of an epic
    epics?: { id: string; name: string }[];
}

export function IssueFilters({ path, params, epics }: IssueFiltersProps) {
    const router = useRouter();
    const [pending, startTransition] = useTransition();
    const [search, setSearch] = useState(params.search ?? "");
    const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

    const navigate = (nextParams: IssueListParams) => {
        startTransition(() => {
            router.replace(issueListHref(path, nextParams), { scroll: false });
        });
    };

    // Every filter change starts again on the first page
    const applyFilter = (change: Partial<IssueListParams>) => navigate({ ...params, ...change, page: 1 });

    // Searches once the user pauses typing, not on every key
    const changeSearch = (value: string) => {
        setSearch(value);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => applyFilter({ search: value.trim() || undefined }), SEARCH_DELAY_MS);
    };

    const reset = () => {
        clearTimeout(searchTimeout.current);
        setSearch("");
        // Keeps the page size, it is no filter
        navigate({ ...parseIssueListParams({}), pageSize: params.pageSize });
    };

    useEffect(() => () => clearTimeout(searchTimeout.current), []);

    return (
        <div className={cn("flex flex-wrap items-center gap-2 transition-opacity duration-100", pending && "opacity-60")}>
            <div className="relative w-full sm:w-60">
                <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
                <Input
                    type="search"
                    value={search}
                    onChange={(event) => changeSearch(event.target.value)}
                    placeholder="Search title or key"
                    aria-label="Search issues"
                    className="pl-8"
                />
            </div>
            <FilterMenu
                label="Status"
                options={issueStatusSelectOptions}
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
            {isIssueListFiltered({ ...params, page: 1 }) && (
                <Button variant="ghost" onClick={reset}>
                    Reset
                    <XIcon />
                </Button>
            )}
        </div>
    );
}
