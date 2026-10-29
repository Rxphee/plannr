"use client";

import { Input } from "@src/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@src/components/ui/Select";
import { cn } from "@src/lib/utils";
import { SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { issueListHref, type IssueListParams } from "./issueListParams";
import { issuePriorityOptions, issueStatusOptions, issueTypeOptions } from "./issueOptions";

// Stands for "no filter" in the selects, which need a value for every option
const ANY = "any";
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

    // Every filter change starts again on the first page
    const applyFilter = (change: Partial<IssueListParams>) => {
        startTransition(() => {
            router.replace(issueListHref(path, { ...params, ...change, page: 1 }), { scroll: false });
        });
    };

    // Searches once the user pauses typing, not on every key
    const changeSearch = (value: string) => {
        setSearch(value);
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(() => applyFilter({ search: value.trim() || undefined }), SEARCH_DELAY_MS);
    };

    useEffect(() => () => clearTimeout(searchTimeout.current), []);

    return (
        <div className={cn("flex flex-wrap items-center gap-2 transition-opacity", pending && "opacity-60")}>
            <div className="relative w-full sm:w-64">
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
            <FilterSelect
                label="Status"
                value={params.status}
                options={[{ value: "open", label: "Open" }, { value: "all", label: "All statuses" }, ...issueStatusOptions]}
                onChange={(status) => applyFilter({ status: status as IssueListParams["status"] })}
            />
            <FilterSelect
                label="Type"
                value={params.type ?? ANY}
                options={[{ value: ANY, label: "All types" }, ...issueTypeOptions]}
                onChange={(type) => applyFilter({ type: type === ANY ? undefined : (type as IssueListParams["type"]) })}
            />
            <FilterSelect
                label="Priority"
                value={params.priority ?? ANY}
                options={[{ value: ANY, label: "All priorities" }, ...issuePriorityOptions]}
                onChange={(priority) => applyFilter({ priority: priority === ANY ? undefined : (priority as IssueListParams["priority"]) })}
            />
            {epics && (
                <FilterSelect
                    label="Epic"
                    value={params.epic ?? ANY}
                    options={[{ value: ANY, label: "All epics" }, ...epics.map((epic) => ({ value: epic.id, label: epic.name }))]}
                    onChange={(epic) => applyFilter({ epic: epic === ANY ? undefined : epic })}
                />
            )}
        </div>
    );
}

interface FilterSelectProps {
    label: string;
    value: string;
    options: { value: string; label: string }[];
    onChange: (value: string) => void;
}

function FilterSelect({ label, value, options, onChange }: FilterSelectProps) {
    return (
        <Select items={options} value={value} onValueChange={(newValue) => newValue && onChange(newValue)}>
            <SelectTrigger className="w-auto min-w-32" aria-label={label}>
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
