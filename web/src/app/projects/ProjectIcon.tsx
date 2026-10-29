import { cn } from "@src/lib/utils";
import type { CSSProperties } from "react";

import { projectHue } from "./projectHue";

interface ProjectIconProps {
    projectKey: string;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
}

const sizeClasses = {
    sm: "size-5 rounded-[0.3rem] text-[0.6875rem]",
    md: "size-8 rounded-md text-sm",
    lg: "size-10 rounded-lg text-base",
    xl: "size-14 rounded-xl text-2xl",
};

// The first letter of the key in the color of the project, so projects stay recognizable in the collapsed sidebar
export function ProjectIcon({ projectKey, size = "sm", className }: ProjectIconProps) {
    return (
        <span
            aria-hidden="true"
            style={{ "--project-hue": projectHue(projectKey) } as CSSProperties}
            className={cn(
                "flex shrink-0 items-center justify-center bg-linear-to-br from-[oklch(0.7_0.15_var(--project-hue))] to-[oklch(0.55_0.17_var(--project-hue))] font-semibold text-white shadow-xs",
                sizeClasses[size],
                className,
            )}
        >
            {projectKey[0]}
        </span>
    );
}
