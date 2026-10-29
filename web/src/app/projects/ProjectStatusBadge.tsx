import { Badge } from "@src/components/ui/Badge";
import type { GQLProjectStatus } from "@src/graphql.generated";

export const projectStatusLabels: Record<GQLProjectStatus, string> = {
    active: "Active",
    paused: "Paused",
    archived: "Archived",
};

export function ProjectStatusBadge({ status }: { status: GQLProjectStatus }) {
    return <Badge variant={status === "active" ? "secondary" : "outline"}>{projectStatusLabels[status]}</Badge>;
}
