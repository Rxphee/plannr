"use client";

import { signOut } from "@src/app/auth/actions";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@src/components/ui/DropdownMenu";
import { SidebarMenuButton } from "@src/components/ui/Sidebar";
import { UserAvatar } from "@src/components/UserAvatar";
import { ChevronsUpDownIcon, KeyRoundIcon, LogOutIcon } from "lucide-react";
import Link from "next/link";

interface UserMenuProps {
    user: { firstName: string; lastName: string; email: string };
}

export function UserMenu({ user }: UserMenuProps) {
    const name = `${user.firstName} ${user.lastName}`;

    return (
        <DropdownMenu>
            <SidebarMenuButton size="lg" tooltip={name} render={<DropdownMenuTrigger />}>
                <UserAvatar user={user} />
                <span className="grid flex-1 text-left leading-tight">
                    <span className="truncate font-medium">{name}</span>
                    <span className="text-sidebar-foreground/60 truncate text-xs">{user.email}</span>
                </span>
                <ChevronsUpDownIcon className="ml-auto" />
            </SidebarMenuButton>
            <DropdownMenuContent side="top" className="min-w-56">
                <DropdownMenuItem render={<Link href="/settings/api-tokens" />}>
                    <KeyRoundIcon />
                    API tokens
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>
                    <LogOutIcon />
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
