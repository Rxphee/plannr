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

// Underlined tabs that switch between the views or sections of a page
export function ViewTabs({ tabs, className }: { tabs: ViewTab[]; className?: string }) {
    const pathname = usePathname();

    return (
        <nav className={cn("-mb-px flex gap-5 overflow-x-auto", className)}>
            {tabs.map((tab) => {
                const isActive = tab.isActive ?? pathname === tab.href;

                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                            "text-muted-foreground hover:text-foreground flex shrink-0 items-center gap-1.5 border-b-2 border-transparent py-2.5 text-sm font-medium transition-colors",
                            isActive && "border-primary text-foreground",
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
