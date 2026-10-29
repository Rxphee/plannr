import { describe, expect, it } from "vitest";

import { formatDueDate, isOverdue } from "./dueDate";

describe("formatDueDate", () => {
    it("formats the day without shifting it", () => {
        expect(formatDueDate("2026-11-05")).toBe("Nov 5, 2026");
    });
});

describe("isOverdue", () => {
    const today = "2026-10-29";

    it("is overdue when an open issue was due before today", () => {
        expect(isOverdue("2026-10-28", "inProgress", today)).toBe(true);
    });

    it.each([
        ["due today", "2026-10-29", "todo"],
        ["without a due date", null, "todo"],
        ["done", "2026-10-01", "done"],
        ["canceled", "2026-10-01", "canceled"],
    ] as const)("is not overdue when %s", (_, dueDate, status) => {
        expect(isOverdue(dueDate, status, today)).toBe(false);
    });
});
