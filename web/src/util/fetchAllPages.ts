// The largest page the API returns (MAX_PAGE_SIZE in api/src/common/pagination.args.ts)
const MAX_PAGE_SIZE = 100;

interface Page<TNode> {
    nodes: TNode[];
    totalCount: number;
}

// Loads every page of a list query, for lists the web app needs in full (e.g. the epics to choose from).
// The first page tells how many entries there are, the other pages are loaded in parallel.
export async function fetchAllPages<TNode>(fetchPage: (pagination: { offset: number; limit: number }) => Promise<Page<TNode>>): Promise<TNode[]> {
    const firstPage = await fetchPage({ offset: 0, limit: MAX_PAGE_SIZE });
    const offsets: number[] = [];
    for (let offset = MAX_PAGE_SIZE; offset < firstPage.totalCount; offset += MAX_PAGE_SIZE) {
        offsets.push(offset);
    }
    const otherPages = await Promise.all(offsets.map((offset) => fetchPage({ offset, limit: MAX_PAGE_SIZE })));
    return [firstPage, ...otherPages].flatMap(({ nodes }) => nodes);
}
