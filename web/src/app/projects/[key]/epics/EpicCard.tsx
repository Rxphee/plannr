import { Badge } from "@src/components/ui/Badge";
import Link from "next/link";

import { EpicProgress } from "./EpicProgress";

interface EpicCardProps {
    projectKey: string;
    epic: { id: string; name: string; isDefault: boolean; issueCount: number; doneIssueCount: number };
}

export function EpicCard({ projectKey, epic }: EpicCardProps) {
    return (
        <Link
            href={`/projects/${projectKey}/epics/${epic.id}`}
            className="group bg-card ring-foreground/10 hover:ring-foreground/25 focus-visible:ring-ring flex h-full flex-col gap-4 rounded-xl p-5 shadow-xs ring-1 transition-[box-shadow,translate] outline-none hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2"
        >
            <div className="flex items-start justify-between gap-3">
                <span className="font-heading min-w-0 truncate font-semibold">{epic.name}</span>
                {epic.isDefault && (
                    <Badge variant="outline" className="text-muted-foreground shrink-0">
                        Default
                    </Badge>
                )}
            </div>
            <EpicProgress epic={epic} className="mt-auto" />
        </Link>
    );
}
