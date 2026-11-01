import { Avatar, AvatarFallback } from "@src/components/ui/Avatar";
import { cn } from "@src/lib/utils";
import { hueFor } from "@src/util/hueFor";
import type { CSSProperties } from "react";

interface UserAvatarProps {
    user: { id: string; firstName: string; lastName: string };
    // xs fits into a select option
    size?: "xs" | "sm" | "default" | "lg";
    className?: string;
}

// Shows the initials in a color of the user until users have profile pictures, like the icons of the projects
export function UserAvatar({ user, size = "default", className }: UserAvatarProps) {
    return (
        <Avatar
            size={size === "xs" ? "sm" : size}
            title={`${user.firstName} ${user.lastName}`}
            style={{ "--user-hue": hueFor(user.id) } as CSSProperties}
            className={cn(size === "xs" && "data-[size=sm]:size-5", className)}
        >
            <AvatarFallback
                className={cn(
                    "bg-linear-to-br from-[oklch(0.7_0.15_var(--user-hue))] to-[oklch(0.55_0.17_var(--user-hue))] text-xs font-medium text-white group-data-[size=lg]/avatar:text-sm",
                    // The fallback sets the text size per avatar size, so xs overrides it the same way
                    size === "xs" && "group-data-[size=sm]/avatar:text-[0.5625rem]",
                )}
            >
                {user.firstName[0]}
                {user.lastName[0]}
            </AvatarFallback>
        </Avatar>
    );
}
