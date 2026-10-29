import { PageContent } from "@src/components/layout/PageContent";
import { PageHeader } from "@src/components/layout/PageHeader";
import { PageIntro } from "@src/components/layout/PageIntro";
import { ViewTabs } from "@src/components/layout/ViewTabs";
import { ListPagination } from "@src/components/ListPagination";
import { Button } from "@src/components/ui/Button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@src/components/ui/Empty";
import type { GQLProjectStatus } from "@src/graphql.generated";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { pageCountOf, type Pagination, paginationHref, parsePagination, toOffsetAndLimit } from "@src/util/pagination";
import { FolderKanbanIcon, PlusIcon } from "lucide-react";
import { redirect } from "next/navigation";

import { CreateProjectDialog } from "./CreateProjectDialog";
import { NewProjectCard } from "./NewProjectCard";
import { projectsQuery } from "./page.gql";
import type { GQLProjectsQuery, GQLProjectsQueryVariables } from "./page.gql.generated";
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

function viewHref(view: View, pagination: Pagination): string {
    return paginationHref("/projects", pagination, view === "open" ? {} : { view });
}

export default async function ProjectsPage({ searchParams }: PageProps<"/projects">) {
    const resolvedSearchParams = await searchParams;
    const currentView: View = isView(resolvedSearchParams.view) ? resolvedSearchParams.view : "open";
    const pagination = parsePagination(resolvedSearchParams);
    const { projects, ...counts } = await graphQLFetch<GQLProjectsQuery, GQLProjectsQueryVariables>(projectsQuery, {
        statuses: views[currentView].statuses,
        ...toOffsetAndLimit(pagination),
    });
    // A page behind the last one, e.g. after archiving projects, shows the last one instead
    const pageCount = pageCountOf(projects.totalCount, pagination);
    if (pagination.page > pageCount) {
        redirect(viewHref(currentView, { ...pagination, page: pageCount }));
    }
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
                            // Another view starts on its first page, with the same page size
                            href: viewHref(view as View, { ...pagination, page: 1 }),
                            count: counts[view as View].totalCount,
                            isActive: view === currentView,
                        }))}
                    />
                }
            />
            {projects.totalCount === 0 && currentView !== "open" ? (
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
                <PageContent className="grid gap-6">
                    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {projects.nodes.map((project) => (
                            <li key={project.id}>
                                <ProjectCard project={project} />
                            </li>
                        ))}
                        {/* The last tile of the open projects, so only on their last page */}
                        {currentView === "open" && pagination.page === pageCount && (
                            <li>
                                <NewProjectCard />
                            </li>
                        )}
                    </ul>
                    <ListPagination
                        pagination={pagination}
                        totalCount={projects.totalCount}
                        href={(otherPagination) => viewHref(currentView, otherPagination)}
                    />
                </PageContent>
            )}
        </>
    );
}
