"use client";

import { Button } from "@src/components/ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@src/components/ui/Select";
import { UserAvatar } from "@src/components/UserAvatar";
import type { GQLProjectMemberRole } from "@src/graphql.generated";
import { XIcon } from "lucide-react";
import { useState, useTransition } from "react";

import { projectMemberRoleOptions } from "../projectMemberRoles";
import { changeProjectMemberRole, removeProjectMember } from "./actions";

interface ProjectMemberListProps {
    project: {
        id: string;
        key: string;
        members: { role: GQLProjectMemberRole; user: { id: string; firstName: string; lastName: string; email: string } }[];
    };
}

export function ProjectMemberList({ project }: ProjectMemberListProps) {
    const [error, setError] = useState<string>();
    const [pending, startTransition] = useTransition();

    const run = (action: () => Promise<{ error?: string }>) => {
        startTransition(async () => {
            const result = await action();
            setError(result.error);
        });
    };

    return (
        <div className="grid gap-2">
            <ul className="divide-y rounded-lg border">
                {project.members.map(({ role, user }) => {
                    const name = `${user.firstName} ${user.lastName}`;
                    const member = { projectId: project.id, userId: user.id };

                    return (
                        <li key={user.id} className="flex items-center gap-3 px-3 py-2.5">
                            <UserAvatar user={user} />
                            <div className="grid min-w-0 flex-1">
                                <span className="truncate text-sm font-medium">{name}</span>
                                <span className="text-muted-foreground truncate text-sm">{user.email}</span>
                            </div>
                            <Select
                                items={projectMemberRoleOptions}
                                value={role}
                                disabled={pending}
                                onValueChange={(newRole) => {
                                    if (newRole) {
                                        run(() => changeProjectMemberRole(project.key, { ...member, role: newRole }));
                                    }
                                }}
                            >
                                <SelectTrigger className="w-28" aria-label={`Role of ${name}`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {projectMemberRoleOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button
                                variant="ghost"
                                size="icon"
                                disabled={pending}
                                aria-label={`Remove ${name}`}
                                onClick={() => run(() => removeProjectMember(project.key, member))}
                            >
                                <XIcon />
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
