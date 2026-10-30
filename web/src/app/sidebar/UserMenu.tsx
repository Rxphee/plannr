"use client";

import { signOut } from "@src/app/auth/actions";
import { InstanceRoleBadge } from "@src/app/users/InstanceRoleBadge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@src/components/ui/DropdownMenu";
import { SidebarMenuButton } from "@src/components/ui/Sidebar";
import { UserAvatar } from "@src/components/UserAvatar";
import type { GQLInstanceRole } from "@src/graphql.generated";
import { ChevronsUpDownIcon, KeyRoundIcon, LogOutIcon } from "lucide-react";
import Link from "next/link";

interface UserMenuProps {
    user: { firstName: string; lastName: string; email: string; instanceRole: GQLInstanceRole };
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
                {user.instanceRole !== "user" && (
                    <>
                        <DropdownMenuGroup>
                            <DropdownMenuLabel className="flex items-center justify-between gap-2">
                                Instance role
                                <InstanceRoleBadge role={user.instanceRole} />
                            </DropdownMenuLabel>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                    </>
                )}
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
