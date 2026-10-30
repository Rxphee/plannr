import { describe, expect, it } from "vitest";

import { parseSearch } from "./search";

describe("parseSearch", () => {
    it("trims the search", () => {
        expect(parseSearch({ search: " header " })).toBe("header");
    });

    it("takes the first of repeated params", () => {
        expect(parseSearch({ search: ["header", "footer"] })).toBe("header");
    });

    it.each([[{}], [{ search: "" }], [{ search: "   " }]])("leaves out an empty search in %o", (searchParams) => {
        expect(parseSearch(searchParams)).toBeUndefined();
    });
});
