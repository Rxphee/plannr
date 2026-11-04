import { cn } from "@src/lib/utils";

// The same picture as app/icon.svg, the favicon. Its three steps stand for projects, epics and issues.
export function Logo({ className }: { className?: string }) {
    return (
        <svg aria-hidden="true" viewBox="0 0 64 64" className={cn("shrink-0", className)}>
            <rect width="64" height="64" rx="14" className="fill-primary" />
            <rect x="13" y="16" width="38" height="8" rx="4" fill="#fff" />
            <rect x="21" y="28" width="30" height="8" rx="4" fill="#fff" opacity=".8" />
            <rect x="29" y="40" width="22" height="8" rx="4" fill="#fff" opacity=".6" />
        </svg>
    );
}
