import type { GQLIssueSortField, GQLIssueView } from "@src/graphql.generated";
import type { Sort, SortFieldOption } from "@src/util/sort";

export const ISSUE_SORT_FIELDS: SortFieldOption<GQLIssueSortField>[] = [
    { value: "createdAt", kind: "date", defaultDirection: "desc" },
    { value: "updatedAt", kind: "date", defaultDirection: "desc" },
    { value: "priority", kind: "rank", defaultDirection: "desc" },
    { value: "dueDate", kind: "deadline", defaultDirection: "asc" },
    { value: "title", kind: "text", defaultDirection: "asc" },
];

// The order of the API without a sort: newest first, the view of due issues the soonest due first
export function defaultIssueSort(view?: GQLIssueView): Sort<GQLIssueSortField> {
    return view === "due" ? { field: "dueDate", direction: "asc" } : { field: "createdAt", direction: "desc" };
}
