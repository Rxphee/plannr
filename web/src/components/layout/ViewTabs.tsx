"use client";

import { cn } from "@src/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface ViewTab {
    label: string;
    href: string;
    count?: number;
    // Tabs that differ only in their search params pass this, otherwise the path decides
    isActive?: boolean;
}

// Underlined tabs that switch between the views or sections of a page.
// The underline rests on the border below instead of overlapping it, so both lines never round to different pixels.
export function ViewTabs({ tabs, className }: { tabs: ViewTab[]; className?: string }) {
    const pathname = usePathname();

    return (
        <nav className={cn("flex gap-5 overflow-x-auto", className)}>
            {tabs.map((tab) => {
                const isActive = tab.isActive ?? pathname === tab.href;

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                            "text-muted-foreground hover:text-foreground hover:after:bg-foreground/25 relative flex shrink-0 items-center gap-1.5 pt-2.5 pb-3 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors",
                            isActive && "text-foreground after:bg-primary hover:after:bg-primary",
                        )}
                    >
                        {tab.label}
                        {tab.count !== undefined && (
                            <span
                                className={cn(
                                    "bg-muted text-muted-foreground min-w-5 rounded-md px-1.5 text-center text-xs tabular-nums",
                                    isActive && "bg-foreground/10 text-foreground",
                                )}
                            >
                                {tab.count}
                            </span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
