import { Badge } from "@src/components/ui/Badge";
import type { GQLInstanceRole } from "@src/graphql.generated";
import { ShieldCheckIcon, ShieldIcon } from "lucide-react";
import { useTranslations } from "next-intl";

// Users without an instance role get no badge, they are the norm
export function InstanceRoleBadge({ role }: { role: GQLInstanceRole }) {
    const t = useTranslations("instanceRole");

    if (role === "superAdmin") {
        return (
            <Badge>
                <ShieldCheckIcon data-icon="inline-start" />
                {t("superAdmin")}
            </Badge>
        );
    }
    if (role === "admin") {
        return (
            <Badge variant="secondary">
                <ShieldIcon data-icon="inline-start" />
                {t("admin")}
            </Badge>
        );
    }
    return null;
}
