import type { GQLIssueType } from "@src/graphql.generated";
import { cn } from "@src/lib/utils";
import { BugIcon, CircleCheckIcon } from "lucide-react";

import { issueTypeLabels } from "./issueOptions";

export function IssueTypeIcon({ type, className }: { type: GQLIssueType; className?: string }) {
    const Icon = type === "bug" ? BugIcon : CircleCheckIcon;

    return (
        <Icon
            role="img"
            aria-label={issueTypeLabels[type]}
            className={cn("size-4 shrink-0", type === "bug" ? "text-rose-500" : "text-muted-foreground", className)}
        />
    );
}
