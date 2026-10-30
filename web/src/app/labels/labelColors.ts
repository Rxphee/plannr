import type { GQLLabelColor } from "@src/graphql.generated";

// Tinted badges with a darker text in the light theme and a lighter one in the dark theme, so every color stays readable in both
export const labelColors: { value: GQLLabelColor; label: string; badgeClassName: string; swatchClassName: string }[] = [
    { value: "gray", label: "Gray", badgeClassName: "bg-neutral-500/15 text-neutral-700 dark:text-neutral-300", swatchClassName: "bg-neutral-500" },
    { value: "red", label: "Red", badgeClassName: "bg-red-500/15 text-red-700 dark:text-red-300", swatchClassName: "bg-red-500" },
    { value: "orange", label: "Orange", badgeClassName: "bg-orange-500/15 text-orange-700 dark:text-orange-300", swatchClassName: "bg-orange-500" },
    { value: "amber", label: "Amber", badgeClassName: "bg-amber-500/20 text-amber-800 dark:text-amber-300", swatchClassName: "bg-amber-500" },
    { value: "green", label: "Green", badgeClassName: "bg-green-500/15 text-green-700 dark:text-green-300", swatchClassName: "bg-green-500" },
    { value: "teal", label: "Teal", badgeClassName: "bg-teal-500/15 text-teal-700 dark:text-teal-300", swatchClassName: "bg-teal-500" },
    { value: "blue", label: "Blue", badgeClassName: "bg-blue-500/15 text-blue-700 dark:text-blue-300", swatchClassName: "bg-blue-500" },
    { value: "violet", label: "Violet", badgeClassName: "bg-violet-500/15 text-violet-700 dark:text-violet-300", swatchClassName: "bg-violet-500" },
    { value: "pink", label: "Pink", badgeClassName: "bg-pink-500/15 text-pink-700 dark:text-pink-300", swatchClassName: "bg-pink-500" },
];

export function findLabelColor(color: GQLLabelColor) {
    return labelColors.find(({ value }) => value === color) ?? labelColors[0];
}
