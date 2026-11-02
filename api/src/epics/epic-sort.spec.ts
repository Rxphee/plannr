import { SortDirection } from "@src/common/sort.js";
import { describe, expect, it } from "vitest";

import { epicOrder, EpicSortField } from "./epic-sort.js";

describe("epicOrder", () => {
    it("lists General first, then the epics by name and ID without a sort", () => {
        expect(epicOrder()).toEqual([{ isDefault: "desc" }, { name: "asc", id: "asc" }]);
    });

    it("keeps General first with a sort and breaks ties by name and ID", () => {
        expect(epicOrder({ field: EpicSortField.createdAt, direction: SortDirection.desc })).toEqual([
            { isDefault: "desc" },
            { createdAt: "desc" },
            { name: "asc", id: "asc" },
        ]);
    });
});
