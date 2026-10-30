import { Badge } from "@src/components/ui/Badge";
import type { GQLInstanceRole } from "@src/graphql.generated";
import { ShieldCheckIcon, ShieldIcon } from "lucide-react";

// Users without an instance role get no badge, they are the norm
export function InstanceRoleBadge({ role }: { role: GQLInstanceRole }) {
    if (role === "superAdmin") {
        return (
            <Badge>
                <ShieldCheckIcon data-icon="inline-start" />
                Super-admin
            </Badge>
        );
    }
    if (role === "admin") {
        return (
            <Badge variant="secondary">
                <ShieldIcon data-icon="inline-start" />
                Admin
            </Badge>
        );
    }
    return null;
}
