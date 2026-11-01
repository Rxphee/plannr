import { Badge } from "@src/components/ui/Badge";
import type { GQLIssueStatus } from "@src/graphql.generated";
import { cn } from "@src/lib/utils";
import { useTranslations } from "next-intl";

const dotClasses: Record<GQLIssueStatus, string> = {
    todo: "border-muted-foreground/70 border-[1.5px]",
    inProgress: "bg-sky-500",
    done: "bg-emerald-500",
    canceled: "bg-muted-foreground/40",
};

export function IssueStatusBadge({ status, className }: { status: GQLIssueStatus; className?: string }) {
    const t = useTranslations("issueStatus");

    return (
        <Badge variant="outline" className={cn("text-muted-foreground h-6 gap-1.5 px-2.5 text-[0.8125rem]", className)}>
            <span aria-hidden="true" className={cn("size-2 rounded-full", dotClasses[status])} />
            {t(status)}
        </Badge>
    );
}

// Only the colored dot, where there is no room for the badge
export function IssueStatusDot({ status, className }: { status: GQLIssueStatus; className?: string }) {
    const t = useTranslations("issueStatus");

    return <span role="img" aria-label={t(status)} className={cn("size-2 shrink-0 rounded-full", dotClasses[status], className)} />;
}
