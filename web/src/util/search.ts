type SearchParams = Record<string, string | string[] | undefined>;

// The search of a list from the search param `search`, without an empty one
export function parseSearch(searchParams: SearchParams): string | undefined {
    const value = searchParams.search;
    return (Array.isArray(value) ? value[0] : value)?.trim() || undefined;
}
