import { cn } from "@src/lib/utils";
import { useFormatter, useTranslations } from "next-intl";

interface EpicProgressProps {
    epic: { issueCount: number; doneIssueCount: number };
    className?: string;
}

// Canceled issues are left out of both counts
export function EpicProgress({ epic: { issueCount, doneIssueCount }, className }: EpicProgressProps) {
    const t = useTranslations("epics");
    const format = useFormatter();
    const percent = issueCount === 0 ? 0 : Math.round((doneIssueCount / issueCount) * 100);

    return (
        <div className={cn("grid gap-1.5", className)}>
            <div
                role="progressbar"
                aria-label={t("progress")}
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                className="bg-muted h-1.5 overflow-hidden rounded-full"
            >
                <div className="h-full rounded-full bg-emerald-500 transition-[width]" style={{ width: `${percent}%` }} />
            </div>
            <div className="text-muted-foreground flex justify-between gap-2 text-sm tabular-nums">
                <span>{issueCount === 0 ? t("noIssuesYet") : t("doneCount", { done: doneIssueCount, total: issueCount })}</span>
                {issueCount > 0 && <span>{format.number(percent / 100, { style: "percent" })}</span>}
            </div>
        </div>
    );
}
