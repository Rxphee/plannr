import { describe, expect, it } from "vitest";

import { pageCountOf, pageWithSize, paginationHref, parsePagination, toOffsetAndLimit } from "./pagination";

describe("parsePagination", () => {
    it("starts on the first page with the default size", () => {
        expect(parsePagination({})).toEqual({ page: 1, pageSize: 25, defaultPageSize: 25 });
    });

    it("reads page and size", () => {
        expect(parsePagination({ page: "3", size: "50" })).toEqual({ page: 3, pageSize: 50, defaultPageSize: 25 });
    });

    it("ignores unknown values", () => {
        expect(parsePagination({ page: "-2", size: "30" })).toEqual({ page: 1, pageSize: 25, defaultPageSize: 25 });
        expect(parsePagination({ page: "1.5", size: "abc" })).toEqual({ page: 1, pageSize: 25, defaultPageSize: 25 });
    });

    it("takes the default size of the list", () => {
        expect(parsePagination({}, 10)).toEqual({ page: 1, pageSize: 10, defaultPageSize: 10 });
        expect(parsePagination({ size: "25" }, 10)).toEqual({ page: 1, pageSize: 25, defaultPageSize: 10 });
    });
});

describe("paginationHref", () => {
    it("leaves out the defaults", () => {
        expect(paginationHref("/projects/WEB/epics", { page: 1, pageSize: 25, defaultPageSize: 25 })).toBe("/projects/WEB/epics");
    });

    it("leaves out the default size of the list", () => {
        expect(paginationHref("/settings", { page: 1, pageSize: 10, defaultPageSize: 10 })).toBe("/settings");
        expect(paginationHref("/settings", { page: 1, pageSize: 25, defaultPageSize: 10 })).toBe("/settings?size=25");
    });

    it("keeps page, size and the other params", () => {
        expect(paginationHref("/projects", { page: 2, pageSize: 100, defaultPageSize: 25 }, { view: "all" })).toBe(
            "/projects?view=all&page=2&size=100",
        );
    });

    it("reads back what it writes", () => {
        const pagination = { page: 4, pageSize: 50, defaultPageSize: 25 };
        const query = new URL(paginationHref("/epics", pagination), "http://localhost").searchParams;
        expect(parsePagination(Object.fromEntries(query))).toEqual(pagination);
    });
});

describe("toOffsetAndLimit", () => {
    it("starts the page after the entries of the pages before", () => {
        expect(toOffsetAndLimit({ page: 3, pageSize: 25 })).toEqual({ offset: 50, limit: 25 });
    });
});

describe("pageCountOf", () => {
    it.each([
        [0, 1],
        [25, 1],
        [26, 2],
        [260, 11],
    ])("has for %i entries %i pages", (totalCount, pageCount) => {
        expect(pageCountOf(totalCount, { pageSize: 25 })).toBe(pageCount);
    });
});

describe("pageWithSize", () => {
    it.each([
        [{ page: 3, pageSize: 25 }, 50, 2],
        [{ page: 2, pageSize: 50 }, 25, 3],
        [{ page: 4, pageSize: 25 }, 100, 1],
        [{ page: 1, pageSize: 100 }, 25, 1],
    ])("keeps the first entry of %o with %i per page on page %i", (pagination, newPageSize, page) => {
        expect(pageWithSize(pagination, newPageSize)).toBe(page);
    });
});
