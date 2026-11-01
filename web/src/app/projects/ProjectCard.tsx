import { markdownToPlainText } from "@src/components/richText/markdownToPlainText";
import { AvatarGroup, AvatarGroupCount } from "@src/components/ui/Avatar";
import { UserAvatar } from "@src/components/UserAvatar";
import type { GQLProjectStatus } from "@src/graphql.generated";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";

import { ProjectIcon } from "./ProjectIcon";
import { ProjectStatusBadge } from "./ProjectStatusBadge";

interface ProjectCardProps {
    project: {
        key: string;
        name: string;
        description: string;
        status: GQLProjectStatus;
        createdAt: string;
        // The first few members for the avatars, the project list loads no more
        members: { totalCount: number; nodes: { user: { id: string; firstName: string; lastName: string } }[] };
    };
}

export function ProjectCard({ project }: ProjectCardProps) {
    const t = useTranslations("common");
    const format = useFormatter();
    const hiddenMemberCount = project.members.totalCount - project.members.nodes.length;

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
            <p className="text-muted-foreground line-clamp-2 min-h-10 text-sm">
                {project.description ? markdownToPlainText(project.description) : t("noDescriptionYet")}
            </p>
            <div className="mt-auto flex items-center justify-between gap-3 border-t pt-4">
                <AvatarGroup className="-space-x-1.5">
                    {project.members.nodes.map(({ user }) => (
                        <UserAvatar key={user.id} user={user} className="ring-card!" />
                    ))}
                    {hiddenMemberCount > 0 && <AvatarGroupCount className="ring-card! text-xs">+{hiddenMemberCount}</AvatarGroupCount>}
                </AvatarGroup>
                <span className="text-muted-foreground text-sm">{t("created", { date: format.dateTime(new Date(project.createdAt), "date") })}</span>
            </div>
        </Link>
    );
}
