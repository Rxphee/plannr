import { Button } from "@src/components/ui/Button";
import { cn } from "@src/lib/utils";
import { XIcon } from "lucide-react";
import type { ComponentProps } from "react";

// Empties a search field; larger than its icon, so it is easy to hit, and red on hover like the other reset actions
export function ClearButton({ className, ...props }: ComponentProps<typeof Button>) {
    return (
        <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Clear search"
            className={cn(
                "text-muted-foreground hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20 size-7 [&_svg:not([class*='size-'])]:size-4",
                className,
            )}
            {...props}
        >
            <XIcon />
        </Button>
    );
}
