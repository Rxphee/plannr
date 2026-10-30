import type { GQLLabelColor } from "@src/graphql.generated";
import { cn } from "@src/lib/utils";

import { findLabelColor } from "./labelColors";

interface LabelBadgeProps {
    label: { name: string; color: GQLLabelColor };
    className?: string;
}

export function LabelBadge({ label, className }: LabelBadgeProps) {
    return (
        <span
            className={cn(
                "inline-block max-w-40 shrink-0 truncate rounded-full px-2 text-xs leading-5 font-medium",
                findLabelColor(label.color).badgeClassName,
                className,
            )}
        >
            {label.name}
        </span>
    );
}

// Only the color, e.g. before the name in a menu
export function LabelColorDot({ color }: { color: GQLLabelColor }) {
    return <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-full", findLabelColor(color).swatchClassName)} />;
}
