import type { GQLEpicSortField } from "@src/graphql.generated";
import type { Sort, SortFieldOption } from "@src/util/sort";

// General stays first in every order
export const EPIC_SORT_FIELDS: SortFieldOption<GQLEpicSortField>[] = [
    { value: "name", kind: "text", defaultDirection: "asc" },
    { value: "createdAt", kind: "date", defaultDirection: "desc" },
    { value: "updatedAt", kind: "date", defaultDirection: "desc" },
];

// The order of the API without a sort
export const DEFAULT_EPIC_SORT: Sort<GQLEpicSortField> = { field: "name", direction: "asc" };
