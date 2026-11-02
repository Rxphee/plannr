import type { GQLProjectSortField } from "@src/graphql.generated";
import type { Sort, SortFieldOption } from "@src/util/sort";

export const PROJECT_SORT_FIELDS: SortFieldOption<GQLProjectSortField>[] = [
    { value: "name", kind: "text", defaultDirection: "asc" },
    { value: "key", kind: "text", defaultDirection: "asc" },
    { value: "createdAt", kind: "date", defaultDirection: "desc" },
    { value: "updatedAt", kind: "date", defaultDirection: "desc" },
];

// The order of the API without a sort
export const DEFAULT_PROJECT_SORT: Sort<GQLProjectSortField> = { field: "name", direction: "asc" };
