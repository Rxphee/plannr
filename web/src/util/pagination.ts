// The page sizes a paginated list offers, the first one is the default
export const PAGE_SIZES = [25, 50, 100];
const DEFAULT_PAGE_SIZE = PAGE_SIZES[0];

// Page and page size live in the search params (`page` and `size`), so a page can be bookmarked like a filter
export interface Pagination {
    page: number;
    pageSize: number;
}

type SearchParams = Record<string, string | string[] | undefined>;

function readNumber(searchParams: SearchParams, name: string): number {
    const value = searchParams[name];
    return Number(Array.isArray(value) ? value[0] : value);
}

// Unknown values fall back to the first page and the default size
export function parsePagination(searchParams: SearchParams): Pagination {
    const page = readNumber(searchParams, "page");
    const pageSize = readNumber(searchParams, "size");
    return {
        page: Number.isInteger(page) && page > 1 ? page : 1,
        pageSize: PAGE_SIZES.includes(pageSize) ? pageSize : DEFAULT_PAGE_SIZE,
    };
}

// Leaves out the defaults, so the first page keeps its plain URL
export function writePagination(searchParams: URLSearchParams, { page, pageSize }: Pagination): void {
    if (page > 1) {
        searchParams.set("page", String(page));
    }
    if (pageSize !== DEFAULT_PAGE_SIZE) {
        searchParams.set("size", String(pageSize));
    }
}

// The URL of a page of a list that has no other search params than the given ones, e.g. the view of the project list
export function paginationHref(path: string, pagination: Pagination, otherParams: Record<string, string> = {}): string {
    const searchParams = new URLSearchParams(otherParams);
    writePagination(searchParams, pagination);
    const query = searchParams.toString();
    return query ? `${path}?${query}` : path;
}

// The arguments of a list query for the page
export function toOffsetAndLimit({ page, pageSize }: Pagination): { offset: number; limit: number } {
    return { offset: (page - 1) * pageSize, limit: pageSize };
}

export function pageCountOf(totalCount: number, { pageSize }: Pagination): number {
    return Math.max(1, Math.ceil(totalCount / pageSize));
}

// The page that shows the same first entry with another page size, so the user does not lose their place
export function pageWithSize({ page, pageSize }: Pagination, newPageSize: number): number {
    return Math.floor(((page - 1) * pageSize) / newPageSize) + 1;
}
