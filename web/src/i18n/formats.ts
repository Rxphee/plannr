import type { Formats } from "next-intl";

export const formats = {
    dateTime: {
        // A moment, e.g. when something was created
        date: { dateStyle: "medium" },
        // A day without time like a due date, formatted in UTC so it never shifts by a day
        day: { dateStyle: "medium", timeZone: "UTC" },
    },
} satisfies Formats;
