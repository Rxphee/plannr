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
            <AvatarFallback className="bg-secondary text-secondary-foreground font-medium group-data-[size=sm]/avatar:text-[0.625rem]">
                {user.firstName[0]}
                {user.lastName[0]}
            </AvatarFallback>
        </Avatar>
    );
}
