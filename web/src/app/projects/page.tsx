import { PageContent } from "@src/components/layout/PageContent";
import { PageHeader } from "@src/components/layout/PageHeader";
import { PageIntro } from "@src/components/layout/PageIntro";
import { ViewTabs } from "@src/components/layout/ViewTabs";
import { Button } from "@src/components/ui/Button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@src/components/ui/Empty";
import type { GQLProjectStatus } from "@src/graphql.generated";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { FolderKanbanIcon, PlusIcon } from "lucide-react";

import { CreateProjectDialog } from "./CreateProjectDialog";
import { NewProjectCard } from "./NewProjectCard";
import { projectsQuery } from "./page.gql";
import type { GQLProjectsQuery } from "./page.gql.generated";
import { ProjectCard } from "./ProjectCard";

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
        <Button>
            <PlusIcon />
            New project
        </Button>
    );

    return (
        <>
            <PageHeader breadcrumbs={[{ label: "Projects" }]} />
            <PageIntro
                title="Projects"
                description="Each project holds the epics and issues of one goal. Open one to see what is going on."
                actions={<CreateProjectDialog trigger={newProjectButton} />}
                tabs={
                    <ViewTabs
                        tabs={Object.entries(views).map(([view, { label }]) => ({
                            label,
                            href: view === "open" ? "/projects" : `/projects?view=${view}`,
                            count: projectsIn(view as View).length,
                            isActive: view === currentView,
                        }))}
                    />
                }
            />
            {visibleProjects.length === 0 && currentView !== "open" ? (
                <Empty className="flex-1">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <FolderKanbanIcon />
                        </EmptyMedia>
                        {currentView === "archived" ? (
                            <>
                                <EmptyTitle>No archived projects</EmptyTitle>
                                <EmptyDescription>Archive a project in its settings once it is done, it then waits here.</EmptyDescription>
                            </>
                        ) : (
                            <>
                                <EmptyTitle>No projects yet</EmptyTitle>
                                <EmptyDescription>
                                    Projects hold the epics and issues of one goal, like a website relaunch or an app.
                                </EmptyDescription>
                            </>
                        )}
                    </EmptyHeader>
                    {currentView !== "archived" && (
                        <EmptyContent>
                            <CreateProjectDialog trigger={newProjectButton} />
                        </EmptyContent>
                    )}
                </Empty>
            ) : (
                <PageContent>
                    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {visibleProjects.map((project) => (
                            <li key={project.id}>
                                <ProjectCard project={project} />
                            </li>
                        ))}
                        {currentView === "open" && (
                            <li>
                                <NewProjectCard />
                            </li>
                        )}
                    </ul>
                </PageContent>
            )}
        </>
    );
}
