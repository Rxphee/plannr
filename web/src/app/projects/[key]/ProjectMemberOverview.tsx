"use client";

import { Button } from "@src/components/ui/Button";
import { UserAvatar } from "@src/components/UserAvatar";
import type { GQLProjectMemberRole } from "@src/graphql.generated";
import { cn } from "@src/lib/utils";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

import { projectMemberRoleLabels, projectMemberRoleOptions } from "./projectMemberRoles";

const PREVIEW_COUNT = 5;

interface ProjectMemberOverviewProps {
    // Sorted by name
    members: { role: GQLProjectMemberRole; user: { id: string; firstName: string; lastName: string } }[];
}

// Owners first and only a few members at first, so the card stays short in large projects
export function ProjectMemberOverview({ members }: ProjectMemberOverviewProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const roleOrder = projectMemberRoleOptions.map(({ value }) => value);
    const sortedMembers = [...members].sort((first, second) => roleOrder.indexOf(first.role) - roleOrder.indexOf(second.role));
    const visibleMembers = isExpanded ? sortedMembers : sortedMembers.slice(0, PREVIEW_COUNT);
    const hiddenCount = members.length - PREVIEW_COUNT;

    return (
        <div className="grid gap-3">
            <ul className={cn("grid gap-3", isExpanded && "-mr-2 max-h-80 overflow-y-auto pr-2")}>
                {visibleMembers.map(({ role, user }) => (
                    <li key={user.id} className="flex items-center gap-3">
                        <UserAvatar user={user} />
                        <span className="flex-1 truncate font-medium">
                            {user.firstName} {user.lastName}
                        </span>
                        <span className="text-muted-foreground text-sm">{projectMemberRoleLabels[role]}</span>
                    </li>
                ))}
            </ul>
            {hiddenCount > 0 && (
                <Button variant="ghost" size="sm" className="text-muted-foreground w-full" onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? "Show less" : `Show all ${members.length} members`}
                    <ChevronDownIcon className={cn("transition-transform", isExpanded && "rotate-180")} />
                </Button>
            )}
        </div>
    );
}
