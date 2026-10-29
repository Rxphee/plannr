import type { GQLIssuePriority } from "@src/graphql.generated";
import { cn } from "@src/lib/utils";
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";

import { issuePriorityLabels } from "./issueOptions";

const icons = { high: ArrowUpIcon, normal: MinusIcon, low: ArrowDownIcon };

export function IssuePriorityIcon({ priority, className }: { priority: GQLIssuePriority; className?: string }) {
    const Icon = icons[priority];

    return (
        <Icon
            role="img"
            aria-label={`${issuePriorityLabels[priority]} priority`}
            className={cn("size-4 shrink-0", priority === "high" ? "text-orange-500" : "text-muted-foreground", className)}
        />
    );
}
