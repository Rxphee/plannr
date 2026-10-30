"use client";

import { Switch } from "@src/components/ui/Switch";
import { UserAvatar } from "@src/components/UserAvatar";
import type { GQLInstanceRole } from "@src/graphql.generated";
import { useState, useTransition } from "react";

import { setUserAdmin } from "./actions";
import { InstanceRoleBadge } from "./InstanceRoleBadge";

interface UserListProps {
    users: { id: string; firstName: string; lastName: string; email: string; instanceRole: GQLInstanceRole }[];
}

export function UserList({ users }: UserListProps) {
    const [error, setError] = useState<string>();
    const [pending, startTransition] = useTransition();

    const changeAdmin = (id: string, isAdmin: boolean) => {
        startTransition(async () => {
            const result = await setUserAdmin({ id, isAdmin });
            setError(result.error);
        });
    };

    return (
        <div className="grid gap-2">
            <ul className="bg-card ring-foreground/10 divide-y overflow-hidden rounded-xl shadow-xs ring-1">
                {users.map((user) => {
                    const name = `${user.firstName} ${user.lastName}`;
                    const isSuperAdmin = user.instanceRole === "superAdmin";

                    return (
                        <li key={user.id} className="flex items-center gap-3 px-4 py-2.5">
                            <UserAvatar user={user} />
                            <div className="grid min-w-0 flex-1">
                                <span className="flex min-w-0 items-center gap-2">
                                    <span className="truncate text-sm font-medium">{name}</span>
                                    <InstanceRoleBadge role={user.instanceRole} />
                                </span>
                                <span className="text-muted-foreground truncate text-sm">{user.email}</span>
                            </div>
                            <label
                                className="text-muted-foreground flex shrink-0 items-center gap-2 text-sm"
                                title={isSuperAdmin ? "The super-admin always has admin rights" : undefined}
                            >
                                Admin
                                <Switch
                                    checked={user.instanceRole !== "user"}
                                    disabled={pending || isSuperAdmin}
                                    aria-label={`Admin rights of ${name}`}
                                    onCheckedChange={(isAdmin) => changeAdmin(user.id, isAdmin)}
                                />
                            </label>
                        </li>
                    );
                })}
            </ul>
            {error && (
                <p className="text-destructive text-sm" aria-live="polite">
                    {error}
                </p>
            )}
        </div>
    );
}
