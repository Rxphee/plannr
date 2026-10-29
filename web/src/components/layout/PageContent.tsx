import { cn } from "@src/lib/utils";
import type { PropsWithChildren } from "react";

// The content below the intro, as wide as the intro so both line up
export function PageContent({ className, children }: PropsWithChildren<{ className?: string }>) {
    return <div className={cn("mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8", className)}>{children}</div>;
}
