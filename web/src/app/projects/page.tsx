import { PageHeader } from "@src/components/layout/PageHeader";
import { ViewTabs } from "@src/components/layout/ViewTabs";
import { AvatarGroup } from "@src/components/ui/Avatar";
import { Button } from "@src/components/ui/Button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@src/components/ui/Empty";
import { UserAvatar } from "@src/components/UserAvatar";
import type { GQLProjectStatus } from "@src/graphql.generated";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { FolderKanbanIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

import { CreateProjectDialog } from "./CreateProjectDialog";
import { projectsQuery } from "./page.gql";
import type { GQLProjectsQuery } from "./page.gql.generated";
import { ProjectKeyIcon } from "./ProjectKeyIcon";
import { ProjectStatusBadge } from "./ProjectStatusBadge";

const MAX_AVATARS = 3;

const views = {
    open: { label: "Open", statuses: ["active", "paused"] },
    archived: { label: "Archived", statuses: ["archived"] },
    all: { label: "All", statuses: ["active", "paused", "archived"] },
} satisfies Record<string, { label: string; statuses: GQLProjectStatus[] }>;

type View = keyof typeof views;

function isView(value: unknown): value is View {
    return typeof value === "string" && value in views;
}

export default async function ProjectsPage({ searchParams }: PageProps<"/projects">) {
    const { view: requestedView } = await searchParams;
    const currentView: View = isView(requestedView) ? requestedView : "open";
    const { projects } = await graphQLFetch<GQLProjectsQuery>(projectsQuery);

    const projectsIn = (view: View) => projects.filter((project) => (views[view].statuses as GQLProjectStatus[]).includes(project.status));
    const visibleProjects = projectsIn(currentView);
    const newProjectButton = (
        <Button size="sm">
            <PlusIcon />
            New project
        </Button>
    );

    return (
        <>
            <PageHeader breadcrumbs={[{ label: "Projects" }]} actions={<CreateProjectDialog trigger={newProjectButton} />} />
            <div className="border-b px-4 md:px-6">
                <ViewTabs
                    tabs={Object.entries(views).map(([view, { label }]) => ({
                        label,
                        href: view === "open" ? "/projects" : `/projects?view=${view}`,
                        count: projectsIn(view as View).length,
                        isActive: view === currentView,
                    }))}
                />
            </div>
            {visibleProjects.length === 0 ? (
                <Empty className="flex-1">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <FolderKanbanIcon />
                        </EmptyMedia>
                        <EmptyTitle>No projects here</EmptyTitle>
                        <EmptyDescription>Projects hold the epics and issues of one goal, like a website relaunch or an app.</EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <CreateProjectDialog trigger={newProjectButton} />
                    </EmptyContent>
                </Empty>
            ) : (
                <ul className="divide-y">
                    {visibleProjects.map((project) => (
                        <li key={project.id}>
                            <Link href={`/projects/${project.key}`} className="hover:bg-muted/50 flex items-center gap-3 px-4 py-3 md:px-6">
                                <ProjectKeyIcon projectKey={project.key} size="lg" />
                                <div className="grid min-w-0 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="truncate font-medium">{project.name}</span>
                                        <span className="text-muted-foreground font-mono text-xs">{project.key}</span>
                                    </div>
                                    {project.description && <span className="text-muted-foreground truncate text-sm">{project.description}</span>}
                                </div>
                                <AvatarGroup className="hidden w-20 justify-end sm:flex">
                                    {project.members.slice(0, MAX_AVATARS).map(({ user }) => (
                                        <UserAvatar key={user.id} user={user} size="sm" />
                                    ))}
                                </AvatarGroup>
                                <div className="flex w-18 justify-end">
                                    <ProjectStatusBadge status={project.status} />
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
