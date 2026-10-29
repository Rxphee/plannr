import { Avatar, AvatarFallback } from "@src/components/ui/Avatar";

interface UserAvatarProps {
    user: { firstName: string; lastName: string };
    size?: "sm" | "default" | "lg";
    className?: string;
}

// Shows the initials until users have profile pictures
export function UserAvatar({ user, size, className }: UserAvatarProps) {
    return (
        <Avatar size={size} title={`${user.firstName} ${user.lastName}`} className={className}>
            <AvatarFallback className="bg-secondary text-secondary-foreground text-xs font-medium group-data-[size=lg]/avatar:text-sm">
                {user.firstName[0]}
                {user.lastName[0]}
            </AvatarFallback>
        </Avatar>
    );
}
