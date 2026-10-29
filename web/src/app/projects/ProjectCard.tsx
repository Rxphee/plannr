import { AvatarGroup, AvatarGroupCount } from "@src/components/ui/Avatar";
import { UserAvatar } from "@src/components/UserAvatar";
import type { GQLProjectStatus } from "@src/graphql.generated";
import Link from "next/link";

import { ProjectIcon } from "./ProjectIcon";
import { ProjectStatusBadge } from "./ProjectStatusBadge";

const MAX_AVATARS = 4;

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

interface ProjectCardProps {
    project: {
        key: string;
        name: string;
        description: string;
        status: GQLProjectStatus;
        createdAt: string;
        members: { user: { id: string; firstName: string; lastName: string } }[];
    };
}

export function ProjectCard({ project }: ProjectCardProps) {
    const hiddenMemberCount = project.members.length - MAX_AVATARS;

    return (
        <Link
            href={`/projects/${project.key}`}
            className="group bg-card ring-foreground/10 hover:ring-foreground/25 focus-visible:ring-ring flex h-full flex-col gap-4 rounded-xl p-5 shadow-xs ring-1 transition-[box-shadow,translate] duration-100 outline-none hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2"
        >
            <div className="flex items-start gap-3">
                <ProjectIcon projectKey={project.key} size="lg" />
                <div className="grid min-w-0 flex-1">
                    <span className="font-heading truncate font-semibold">{project.name}</span>
                    <span className="text-muted-foreground font-mono text-sm">{project.key}</span>
                </div>
                <ProjectStatusBadge status={project.status} />
            </div>
            <p className="text-muted-foreground line-clamp-2 min-h-10 text-sm">{project.description || "No description yet."}</p>
            <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4">
                <AvatarGroup className="-space-x-1.5">
                    {project.members.slice(0, MAX_AVATARS).map(({ user }) => (
                        <UserAvatar key={user.id} user={user} className="ring-card!" />
                    ))}
                    {hiddenMemberCount > 0 && <AvatarGroupCount className="ring-card! text-xs">+{hiddenMemberCount}</AvatarGroupCount>}
                </AvatarGroup>
                <span className="text-muted-foreground text-sm">Created {dateFormat.format(new Date(project.createdAt))}</span>
            </div>
        </Link>
    );
}
