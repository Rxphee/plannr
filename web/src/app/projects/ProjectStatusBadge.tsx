import { Badge } from "@src/components/ui/Badge";
import type { GQLProjectStatus } from "@src/graphql.generated";
import { cn } from "@src/lib/utils";

export const projectStatusLabels: Record<GQLProjectStatus, string> = {
    active: "Active",
    paused: "Paused",
    archived: "Archived",
};

const dotClasses: Record<GQLProjectStatus, string> = {
    active: "bg-emerald-500",
    paused: "bg-amber-500",
    archived: "bg-muted-foreground/60",
};

export function ProjectStatusBadge({ status }: { status: GQLProjectStatus }) {
    return (
        <Badge variant="outline" className="text-muted-foreground gap-1.5">
            <span aria-hidden="true" className={cn("size-1.5 rounded-full", dotClasses[status])} />
            {projectStatusLabels[status]}
        </Badge>
    );
}
