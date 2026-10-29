import { Avatar, AvatarFallback } from "@src/components/ui/Avatar";

interface UserAvatarProps {
    user: { firstName: string; lastName: string };
    size?: "sm" | "default" | "lg";
}

// Shows the initials until users have profile pictures
export function UserAvatar({ user, size }: UserAvatarProps) {
    return (
        <Avatar size={size} title={`${user.firstName} ${user.lastName}`}>
            <AvatarFallback>
                {user.firstName[0]}
                {user.lastName[0]}
            </AvatarFallback>
        </Avatar>
    );
}
