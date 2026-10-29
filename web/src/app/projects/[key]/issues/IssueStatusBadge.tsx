import { Badge } from "@src/components/ui/Badge";
import type { GQLIssueStatus } from "@src/graphql.generated";
import { cn } from "@src/lib/utils";

import { issueStatusLabels } from "./issueOptions";

const dotClasses: Record<GQLIssueStatus, string> = {
    todo: "border-muted-foreground/70 border-[1.5px]",
    inProgress: "bg-sky-500",
    done: "bg-emerald-500",
    canceled: "bg-muted-foreground/40",
};

export function IssueStatusBadge({ status, className }: { status: GQLIssueStatus; className?: string }) {
    return (
        <Badge variant="outline" className={cn("text-muted-foreground h-6 gap-1.5 px-2.5 text-[0.8125rem]", className)}>
            <span aria-hidden="true" className={cn("size-2 rounded-full", dotClasses[status])} />
            {issueStatusLabels[status]}
        </Badge>
    );
}

// Only the colored dot, where there is no room for the badge
export function IssueStatusDot({ status, className }: { status: GQLIssueStatus; className?: string }) {
    return <span role="img" aria-label={issueStatusLabels[status]} className={cn("size-2 shrink-0 rounded-full", dotClasses[status], className)} />;
}
