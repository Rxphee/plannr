import type { GQLIssueType } from "@src/graphql.generated";
import { cn } from "@src/lib/utils";
import { BugIcon, CircleCheckIcon } from "lucide-react";
import { useTranslations } from "next-intl";

export function IssueTypeIcon({ type, className }: { type: GQLIssueType; className?: string }) {
    const t = useTranslations("issueType");
    const Icon = type === "bug" ? BugIcon : CircleCheckIcon;

    return (
        <Icon
            role="img"
            aria-label={t(type)}
            className={cn("size-4 shrink-0", type === "bug" ? "text-rose-500" : "text-muted-foreground", className)}
        />
    );
}
