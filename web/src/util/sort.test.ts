import { describe, expect, it } from "vitest";

import { isSameSort, parseSort, type SortFieldOption, sortParam } from "./sort";

const fields: SortFieldOption<"name" | "createdAt">[] = [
    { value: "name", kind: "text", defaultDirection: "asc" },
    { value: "createdAt", kind: "date", defaultDirection: "desc" },
];

describe("parseSort", () => {
    it("reads the field and the direction", () => {
        expect(parseSort({ sort: "createdAt-asc" }, fields)).toEqual({ field: "createdAt", direction: "asc" });
    });

    it("takes the first of repeated params", () => {
        expect(parseSort({ sort: ["name-desc", "createdAt-asc"] }, fields)).toEqual({ field: "name", direction: "desc" });
    });

    it.each([[{}], [{ sort: "" }], [{ sort: "name" }], [{ sort: "priority-desc" }], [{ sort: "name-up" }]])(
        "leaves the order to the API for %o",
        (searchParams) => {
            expect(parseSort(searchParams, fields)).toBeUndefined();
        },
    );

    it("reads back what sortParam writes", () => {
        const sort = { field: "name", direction: "desc" } as const;
        expect(parseSort({ sort: sortParam(sort) }, fields)).toEqual(sort);
    });
});

describe("isSameSort", () => {
    it("compares field and direction", () => {
        expect(isSameSort({ field: "name", direction: "asc" }, { field: "name", direction: "asc" })).toBe(true);
        expect(isSameSort({ field: "name", direction: "asc" }, { field: "name", direction: "desc" })).toBe(false);
    });
});
