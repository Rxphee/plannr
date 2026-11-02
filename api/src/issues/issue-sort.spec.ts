import { RawQueryFragment } from "@mikro-orm/postgresql";
import { SortDirection } from "@src/common/sort.js";
import { describe, expect, it } from "vitest";

import { issueOrder, IssueSortField } from "./issue-sort.js";
import { IssueView } from "./issue-views.js";

describe("issueOrder", () => {
    it("lists the newest issues first without a sort, by number within a project and by creation time and ID across projects", () => {
        expect(issueOrder({ isWithinProject: true })).toEqual([{ number: "desc" }]);
        expect(issueOrder({ isWithinProject: false })).toEqual([{ createdAt: "desc", id: "desc" }]);
    });

    it("lists the due issues the soonest due first without a sort", () => {
        expect(issueOrder({ view: IssueView.due, isWithinProject: true })).toEqual([{ dueDate: "asc" }, { number: "desc" }]);
    });

    it("sorts by creation in both directions", () => {
        const sort = { field: IssueSortField.createdAt, direction: SortDirection.asc };

        expect(issueOrder({ sort, isWithinProject: true })).toEqual([{ number: "asc" }]);
        expect(issueOrder({ sort, isWithinProject: false })).toEqual([{ createdAt: "asc", id: "asc" }]);
    });

    it.each([IssueSortField.title, IssueSortField.updatedAt])("sorts by %s, then newest first", (field) => {
        expect(issueOrder({ sort: { field, direction: SortDirection.desc }, isWithinProject: true })).toEqual([
            { [field]: "desc" },
            { number: "desc" },
        ]);
    });

    it("puts issues without a due date last in both directions", () => {
        for (const direction of [SortDirection.asc, SortDirection.desc]) {
            expect(issueOrder({ sort: { field: IssueSortField.dueDate, direction }, isWithinProject: true })[0]).toEqual({
                dueDate: `${direction} nulls last`,
            });
        }
    });

    it("sorts by the rank of the priority instead of its name, then newest first", () => {
        const [byPriority, newestFirst] = issueOrder({
            sort: { field: IssueSortField.priority, direction: SortDirection.desc },
            isWithinProject: true,
        });
        const [key] = Object.getOwnPropertySymbols(byPriority);

        expect(RawQueryFragment.getKnownFragment(key)?.sql).toMatch(/^array_position\(array\['low', 'normal', 'high'\], .+\."priority"\)$/);
        expect((byPriority as Record<symbol, string>)[key]).toBe("desc");
        expect(newestFirst).toEqual({ number: "desc" });
    });
});
