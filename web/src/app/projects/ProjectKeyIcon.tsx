import { cn } from "@src/lib/utils";

interface ProjectKeyIconProps {
    projectKey: string;
    size?: "sm" | "lg";
}

// The first letter of the key as an icon, so projects stay recognizable in the collapsed sidebar
export function ProjectKeyIcon({ projectKey, size = "sm" }: ProjectKeyIconProps) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                "bg-primary/10 text-primary flex shrink-0 items-center justify-center rounded-md font-semibold",
                size === "sm" ? "size-4 text-[0.625rem]" : "size-10 text-lg",
            )}
        >
            {projectKey[0]}
        </span>
    );
}
