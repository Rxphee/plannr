import type { GQLEpicSortField, GQLIssueSortField, GQLProjectSortField, GQLSortDirection } from "@src/graphql.generated";

export type SortField = GQLIssueSortField | GQLEpicSortField | GQLProjectSortField;

export interface Sort<Field extends SortField = SortField> {
    field: Field;
    direction: GQLSortDirection;
}

// Decides how the directions are named, e.g. "A–Z" for a text and "Highest first" for a priority
type SortKind = "date" | "deadline" | "text" | "rank";

// A field a list can be sorted by, for the sort menu
export interface SortFieldOption<Field extends SortField> {
    value: Field;
    kind: SortKind;
    // Chosen with the field, so that a new field starts with what a person expects on top
    defaultDirection: GQLSortDirection;
}

type SearchParams = Record<string, string | string[] | undefined>;

const DIRECTIONS: GQLSortDirection[] = ["asc", "desc"];

// The sort of a list from the search param `sort`, e.g. `priority-desc`. Without one, or with an unknown one, the list keeps the order of the API.
export function parseSort<Field extends SortField>(searchParams: SearchParams, fields: SortFieldOption<Field>[]): Sort<Field> | undefined {
    const value = searchParams.sort;
    const [field, direction] = (Array.isArray(value) ? value[0] : value)?.split("-") ?? [];
    const knownField = fields.find((option) => option.value === field)?.value;
    const knownDirection = DIRECTIONS.find((candidate) => candidate === direction);
    return knownField && knownDirection ? { field: knownField, direction: knownDirection } : undefined;
}

export function sortParam({ field, direction }: Sort): string {
    return `${field}-${direction}`;
}

export function isSameSort(sort: Sort, otherSort: Sort): boolean {
    return sort.field === otherSort.field && sort.direction === otherSort.direction;
}
