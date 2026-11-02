import { SortDirection } from "@src/common/sort.js";
import { describe, expect, it } from "vitest";

import { projectOrder, ProjectSortField } from "./project-sort.js";

describe("projectOrder", () => {
    it("lists the projects by name and ID without a sort", () => {
        expect(projectOrder()).toEqual([{ name: "asc" }, { id: "asc" }]);
    });

    it("sorts by the given field, then by ID", () => {
        expect(projectOrder({ field: ProjectSortField.key, direction: SortDirection.desc })).toEqual([{ key: "desc" }, { id: "asc" }]);
    });
});
