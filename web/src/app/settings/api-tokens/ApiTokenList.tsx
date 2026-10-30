import { Badge } from "@src/components/ui/Badge";
import { KeyRoundIcon } from "lucide-react";

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

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

function formatDate(date: string): string {
    return dateFormat.format(new Date(date));
}

export function ApiTokenList({ apiTokens }: { apiTokens: ApiToken[] }) {
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
                                {hasExpired && <Badge variant="destructive">Expired</Badge>}
                            </div>
                            <span className="text-muted-foreground text-sm">
                                Created {formatDate(createdAt)} · {lastUsedAt ? `Last used ${formatDate(lastUsedAt)}` : "Never used"} ·{" "}
                                {expiresAt ? `${hasExpired ? "Expired" : "Expires"} ${formatDate(expiresAt)}` : "No expiry"}
                            </span>
                        </div>
                        <RevokeApiTokenDialog apiToken={apiToken} />
                    </li>
                );
            })}
        </ul>
    );
}
