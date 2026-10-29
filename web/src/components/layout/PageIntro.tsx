import { cn } from "@src/lib/utils";
import type { ReactNode } from "react";

interface PageIntroProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    // Shown next to the title, e.g. a status badge
    badge?: ReactNode;
    // Shown below the title, e.g. the key of a project
    meta?: ReactNode;
    // The view tabs of the page, they sit on the bottom border
    tabs?: ReactNode;
}

export function PageIntro({ title, description, icon, badge, meta, tabs }: PageIntroProps) {
    return (
        <div className="border-b">
            <div className={cn("mx-auto grid w-full max-w-6xl gap-5 px-4 pt-8 md:px-8", !tabs && "pb-6")}>
                <div className="flex items-start gap-4">
                    {icon}
                    <div className="grid min-w-0 gap-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <h1 className="font-heading truncate text-2xl font-semibold tracking-tight">{title}</h1>
                            {badge}
                        </div>
                        {meta && <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 text-sm">{meta}</div>}
                        {description && <p className="text-muted-foreground max-w-2xl text-sm">{description}</p>}
                    </div>
                </div>
                {tabs}
            </div>
        </div>
    );
}
