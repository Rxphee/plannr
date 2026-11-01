"use client";

import { InstanceRoleBadge } from "@src/app/users/InstanceRoleBadge";
import { Button } from "@src/components/ui/Button";
import { UserAvatar } from "@src/components/UserAvatar";
import type { GQLInstanceRole } from "@src/graphql.generated";
import { UserPlusIcon } from "lucide-react";
import { useState, useTransition } from "react";

import { addProjectMembers } from "./actions";

interface ProjectAdminAccessListProps {
    projectId: string;
    admins: { id: string; firstName: string; lastName: string; email: string; instanceRole: GQLInstanceRole }[];
}

// Admins who are not a member, so it is clear that more people than the members can see and change the project
export function ProjectAdminAccessList({ projectId, admins }: ProjectAdminAccessListProps) {
    const [error, setError] = useState<string>();
    const [pending, startTransition] = useTransition();

    const addAsMember = (userId: string) => {
        startTransition(async () => {
            const result = await addProjectMembers({ projectId, userIds: [userId], role: "member" });
            setError(result.error);
        });
    };

    return (
        <div className="grid gap-2">
            <div className="grid gap-0.5">
                <h3 className="text-sm font-medium">Access through admin rights</h3>
                <p className="text-muted-foreground text-sm">
                    Admins see and change every project without being a member. Add them to keep their access once their admin rights end.
                </p>
            </div>
            <ul className="divide-y rounded-lg border border-dashed">
                {admins.map((admin) => {
                    const name = `${admin.firstName} ${admin.lastName}`;

                    return (
                        <li key={admin.id} className="flex items-center gap-3 px-3 py-2.5">
                            <UserAvatar user={admin} />
                            <div className="grid min-w-0 flex-1">
                                <span className="flex min-w-0 items-center gap-2">
                                    <span className="truncate text-sm font-medium">{name}</span>
                                    <InstanceRoleBadge role={admin.instanceRole} />
                                </span>
                                <span className="text-muted-foreground truncate text-sm">{admin.email}</span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={pending}
                                aria-label={`Add ${name} as member`}
                                onClick={() => addAsMember(admin.id)}
                            >
                                <UserPlusIcon />
                                <span className="hidden sm:inline">Add as member</span>
                            </Button>
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
