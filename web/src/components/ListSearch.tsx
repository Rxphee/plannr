"use client";

import { SearchInput } from "@src/components/SearchInput";
import { useDebouncedSearch } from "@src/hooks/useDebouncedSearch";
import { cn } from "@src/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

interface ListSearchProps {
    placeholder: string;
    label: string;
}

// Searches a paginated list through the search param `search`, keeping the other params such as the view or the page size
export function ListSearch({ placeholder, label }: ListSearchProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [pending, startTransition] = useTransition();

    const replaceSearch = (nextSearch?: string) => {
        const nextSearchParams = new URLSearchParams(searchParams);
        // Another search starts again on the first page
        nextSearchParams.delete("page");
        if (nextSearch) {
            nextSearchParams.set("search", nextSearch);
        } else {
            nextSearchParams.delete("search");
        }
        const query = nextSearchParams.toString();
        startTransition(() => {
            router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
        });
    };

    const { search, changeSearch, clearSearch } = useDebouncedSearch(searchParams.get("search") ?? "", replaceSearch);

    const clear = () => {
        clearSearch();
        replaceSearch();
    };

    return (
        <SearchInput
            value={search}
            onChange={changeSearch}
            onClear={clear}
            placeholder={placeholder}
            label={label}
            className={cn("transition-opacity duration-100", pending && "opacity-60")}
        />
    );
}
