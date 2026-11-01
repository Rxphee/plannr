import { Badge } from "@src/components/ui/Badge";
import { KeyRoundIcon } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

import { isExpired } from "./apiTokenExpiry";
import { RevokeApiTokenDialog } from "./RevokeApiTokenDialog";

interface ApiToken {
    id: string;
    name: string;
    prefix: string;
    createdAt: string;
    expiresAt: string | null;
    lastUsedAt: string | null;
}

export function ApiTokenList({ apiTokens }: { apiTokens: ApiToken[] }) {
    const t = useTranslations("apiTokens");
    const format = useFormatter();
    const formatDate = (date: string) => format.dateTime(new Date(date), "date");

    return (
        <ul className="divide-y rounded-lg border">
            {apiTokens.map((apiToken) => {
                const { id, name, prefix, createdAt, expiresAt, lastUsedAt } = apiToken;
                const hasExpired = isExpired(expiresAt);

                return (
                    <li key={id} className="flex items-center gap-3 px-3 py-2.5">
                        <KeyRoundIcon className="text-muted-foreground size-4 shrink-0" />
                        <div className="grid min-w-0 flex-1 gap-0.5">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                <span className="truncate text-sm font-medium">{name}</span>
                                <code className="text-muted-foreground text-xs">{prefix}…</code>
                                {hasExpired && <Badge variant="destructive">{t("expired")}</Badge>}
                            </div>
                            <span className="text-muted-foreground text-sm">
                                {[
                                    t("created", { date: formatDate(createdAt) }),
                                    lastUsedAt ? t("lastUsed", { date: formatDate(lastUsedAt) }) : t("neverUsed"),
                                    expiresAt ? t(hasExpired ? "expiredOn" : "expiresOn", { date: formatDate(expiresAt) }) : t("noExpiry"),
                                ].join(" · ")}
                            </span>
                        </div>
                        <RevokeApiTokenDialog apiToken={apiToken} />
                    </li>
                );
            })}
        </ul>
    );
}
