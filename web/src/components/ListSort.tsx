"use client";

import { SortMenu } from "@src/components/SortMenu";
import { useListSearchParams } from "@src/hooks/useListSearchParams";
import { cn } from "@src/lib/utils";
import { isSameSort, parseSort, type Sort, type SortField, type SortFieldOption, sortParam } from "@src/util/sort";

interface ListSortProps<Field extends SortField> {
    fields: SortFieldOption<Field>[];
    // The order of the API without a sort, which keeps the plain URL
    defaultSort: Sort<Field>;
}

// Sorts a paginated list through the search param `sort`, keeping the other params such as the search or the page size
export function ListSort<Field extends SortField>({ fields, defaultSort }: ListSortProps<Field>) {
    const { searchParams, changeSearchParams, pending } = useListSearchParams();
    const sort = parseSort(Object.fromEntries(searchParams), fields) ?? defaultSort;

    const changeSort = (nextSort: Sort<Field>) => {
        changeSearchParams((nextSearchParams) => {
            if (isSameSort(nextSort, defaultSort)) {
                nextSearchParams.delete("sort");
            } else {
                nextSearchParams.set("sort", sortParam(nextSort));
            }
        });
    };

    return (
        <div className={cn("transition-opacity duration-100", pending && "opacity-60")}>
            <SortMenu fields={fields} sort={sort} onChange={changeSort} />
        </div>
    );
}
