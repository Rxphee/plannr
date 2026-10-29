import { describe, expect, it, vi } from "vitest";

import { fetchAllPages } from "./fetchAllPages";

function pagesOf(count: number) {
    const entries = Array.from({ length: count }, (_, index) => index);
    return vi.fn(async ({ offset, limit }: { offset: number; limit: number }) => ({
        nodes: entries.slice(offset, offset + limit),
        totalCount: count,
    }));
}

describe("fetchAllPages", () => {
    it("loads a short list with one request", async () => {
        const fetchPage = pagesOf(42);
        expect(await fetchAllPages(fetchPage)).toHaveLength(42);
        expect(fetchPage).toHaveBeenCalledTimes(1);
    });

    it("loads all pages of a long list in order", async () => {
        const fetchPage = pagesOf(250);
        expect(await fetchAllPages(fetchPage)).toEqual(Array.from({ length: 250 }, (_, index) => index));
        expect(fetchPage.mock.calls.map(([pagination]) => pagination)).toEqual([
            { offset: 0, limit: 100 },
            { offset: 100, limit: 100 },
            { offset: 200, limit: 100 },
        ]);
    });

    it("loads a list of exactly one page with one request", async () => {
        const fetchPage = pagesOf(100);
        expect(await fetchAllPages(fetchPage)).toHaveLength(100);
        expect(fetchPage).toHaveBeenCalledTimes(1);
    });

    it("returns an empty list", async () => {
        expect(await fetchAllPages(pagesOf(0))).toEqual([]);
    });
});
