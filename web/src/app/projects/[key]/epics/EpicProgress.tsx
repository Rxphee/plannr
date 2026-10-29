import { cn } from "@src/lib/utils";

interface EpicProgressProps {
    epic: { issueCount: number; doneIssueCount: number };
    className?: string;
}

// Canceled issues are left out of both counts
export function EpicProgress({ epic: { issueCount, doneIssueCount }, className }: EpicProgressProps) {
    const percent = issueCount === 0 ? 0 : Math.round((doneIssueCount / issueCount) * 100);

    return (
        <div className={cn("grid gap-1.5", className)}>
            <div
                role="progressbar"
                aria-label="Progress"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                className="bg-muted h-1.5 overflow-hidden rounded-full"
            >
                <div className="h-full rounded-full bg-emerald-500 transition-[width]" style={{ width: `${percent}%` }} />
            </div>
            <div className="text-muted-foreground flex justify-between gap-2 text-sm tabular-nums">
                <span>{issueCount === 0 ? "No issues yet" : `${doneIssueCount} of ${issueCount} done`}</span>
                {issueCount > 0 && <span>{percent}%</span>}
            </div>
        </div>
    );
}
