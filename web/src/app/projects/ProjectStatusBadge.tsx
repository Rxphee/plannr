import { Badge } from "@src/components/ui/Badge";
import type { GQLProjectStatus } from "@src/graphql.generated";
import { cn } from "@src/lib/utils";
import { useTranslations } from "next-intl";

const dotClasses: Record<GQLProjectStatus, string> = {
    active: "bg-emerald-500",
    paused: "bg-amber-500",
    archived: "bg-muted-foreground/60",
};

export function ProjectStatusBadge({ status }: { status: GQLProjectStatus }) {
    const t = useTranslations("projectStatus");

    return (
        <Badge variant="outline" className="text-muted-foreground h-6 gap-1.5 px-2.5 text-[0.8125rem]">
            <span aria-hidden="true" className={cn("size-2 rounded-full", dotClasses[status])} />
            {t(status)}
        </Badge>
    );
}
