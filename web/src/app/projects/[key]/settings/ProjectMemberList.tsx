"use client";

import { InstanceRoleBadge } from "@src/app/users/InstanceRoleBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@src/components/ui/Select";
import { UserAvatar } from "@src/components/UserAvatar";
import type { GQLInstanceRole, GQLProjectMemberRole } from "@src/graphql.generated";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { PROJECT_MEMBER_ROLES } from "../projectMemberRoles";
import { changeProjectMemberRole } from "./actions";
import { RemoveProjectMemberDialog } from "./RemoveProjectMemberDialog";

interface ProjectMemberListProps {
    project: {
        id: string;
        key: string;
        name: string;
        members: {
            role: GQLProjectMemberRole;
            assignedIssueCount: number;
            user: { id: string; firstName: string; lastName: string; email: string; instanceRole: GQLInstanceRole };
        }[];
    };
}

export function ProjectMemberList({ project }: ProjectMemberListProps) {
    const t = useTranslations("projectSettings");
    const tRole = useTranslations("projectMemberRole");
    const roleOptions = PROJECT_MEMBER_ROLES.map((role) => ({ value: role, label: tRole(role) }));
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
            <ul className="@container divide-y rounded-lg border">
                {project.members.map(({ role, assignedIssueCount, user }) => {
                    const name = `${user.firstName} ${user.lastName}`;
                    const member = { projectId: project.id, userId: user.id };

                    return (
                        <li key={user.id} className="flex flex-col gap-2 px-3 py-2.5 @md:flex-row @md:items-center @md:gap-3">
                            <div className="flex min-w-0 flex-1 items-center gap-3">
                                <UserAvatar user={user} />
                                <div className="grid min-w-0 flex-1">
                                    <span className="flex min-w-0 items-center gap-2">
                                        <span className="truncate text-sm font-medium">{name}</span>
                                        <InstanceRoleBadge role={user.instanceRole} />
                                    </span>
                                    <span className="text-muted-foreground truncate text-sm">{user.email}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-3 pl-11 @md:pl-0">
                                <Select
                                    items={roleOptions}
                                    value={role}
                                    disabled={pending}
                                    onValueChange={(newRole) => {
                                        if (newRole) {
                                            run(() => changeProjectMemberRole(project.key, { ...member, role: newRole }));
                                        }
                                    }}
                                >
                                    <SelectTrigger className="w-28" aria-label={t("roleOf", { name })}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roleOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <RemoveProjectMemberDialog project={project} member={{ assignedIssueCount, user }} />
                            </div>
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
