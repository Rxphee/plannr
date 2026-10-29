import type { GQLIssueStatus } from "@src/graphql.generated";

// Due dates are days without time, so they are formatted in UTC to never shift by a day
const dueDateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" });

export function formatDueDate(dueDate: string): string {
    return dueDateFormat.format(new Date(dueDate));
}

// Done and canceled issues are never overdue
export function isOverdue(dueDate: string | null, status: GQLIssueStatus, today: string = localDate(new Date())): boolean {
    return dueDate !== null && (status === "todo" || status === "inProgress") && dueDate < today;
}

// The day in YYYY-MM-DD, the format of due dates
function localDate(date: Date): string {
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()].map((part) => String(part).padStart(2, "0")).join("-");
}
