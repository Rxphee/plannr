import { PageContent } from "@src/components/layout/PageContent";
import { PageHeader } from "@src/components/layout/PageHeader";
import { PageIntro } from "@src/components/layout/PageIntro";
import { ViewTabs } from "@src/components/layout/ViewTabs";
import { ListPagination } from "@src/components/ListPagination";
import { ListSearch } from "@src/components/ListSearch";
import { Button } from "@src/components/ui/Button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@src/components/ui/Empty";
import type { GQLProjectStatus } from "@src/graphql.generated";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { pageCountOf, type Pagination, paginationHref, parsePagination, toOffsetAndLimit } from "@src/util/pagination";
import { parseSearch } from "@src/util/search";
import { FolderKanbanIcon, PlusIcon, SearchXIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { CreateProjectDialog } from "./CreateProjectDialog";
import { NewProjectCard } from "./NewProjectCard";
import { projectsQuery } from "./page.gql";
import type { GQLProjectsQuery, GQLProjectsQueryVariables } from "./page.gql.generated";
import { ProjectCard } from "./ProjectCard";

const views = {
    open: { statuses: ["active", "paused"] },
    archived: { statuses: ["archived"] },
    all: { statuses: ["active", "paused", "archived"] },
} satisfies Record<string, { statuses: GQLProjectStatus[] }>;

type View = keyof typeof views;

function isView(value: unknown): value is View {
    return typeof value === "string" && value in views;
}

function viewHref(view: View, pagination: Pagination, search?: string): string {
    return paginationHref("/projects", pagination, { ...(view !== "open" && { view }), ...(search && { search }) });
}

export default async function ProjectsPage({ searchParams }: PageProps<"/projects">) {
    const resolvedSearchParams = await searchParams;
    const currentView: View = isView(resolvedSearchParams.view) ? resolvedSearchParams.view : "open";
    const pagination = parsePagination(resolvedSearchParams);
    const search = parseSearch(resolvedSearchParams);
    const [{ projects, ...counts }, t, tCommon] = await Promise.all([
        graphQLFetch<GQLProjectsQuery, GQLProjectsQueryVariables>(projectsQuery, {
            statuses: views[currentView].statuses,
            search,
            ...toOffsetAndLimit(pagination),
        }),
        getTranslations("projects"),
        getTranslations("common"),
    ]);
    // A page behind the last one, e.g. after archiving projects, shows the last one instead
    const pageCount = pageCountOf(projects.totalCount, pagination);
    if (pagination.page > pageCount) {
        redirect(viewHref(currentView, { ...pagination, page: pageCount }, search));
    }
    const newProjectButton = (
        <Button>
            <PlusIcon />
            {t("newProject")}
        </Button>
    );

    return (
        <>
            <PageHeader breadcrumbs={[{ label: tCommon("projects") }]} />
            <PageIntro
                title={tCommon("projects")}
                description={t("description")}
                actions={<CreateProjectDialog trigger={newProjectButton} />}
                tabs={
                    <ViewTabs
                        tabs={(Object.keys(views) as View[]).map((view) => ({
                            label: t(`views.${view}`),
                            // Another view starts on its first page, with the same page size and search
                            href: viewHref(view, { ...pagination, page: 1 }, search),
                            count: counts[view].totalCount,
                            isActive: view === currentView,
                        }))}
                    />
                }
            />
            {projects.totalCount === 0 && !search && currentView !== "open" ? (
                <Empty className="flex-1">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <FolderKanbanIcon />
                        </EmptyMedia>
                        {currentView === "archived" ? (
                            <>
                                <EmptyTitle>{t("noArchivedTitle")}</EmptyTitle>
                                <EmptyDescription>{t("noArchivedDescription")}</EmptyDescription>
                            </>
                        ) : (
                            <>
                                <EmptyTitle>{t("noProjectsTitle")}</EmptyTitle>
                                <EmptyDescription>{t("noProjectsDescription")}</EmptyDescription>
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
                    <ListSearch placeholder={t("searchPlaceholder")} label={t("searchLabel")} />
                    {projects.totalCount === 0 && search ? (
                        <Empty className="rounded-xl border border-dashed">
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <SearchXIcon />
                                </EmptyMedia>
                                <EmptyTitle>{t("noMatchesTitle")}</EmptyTitle>
                                <EmptyDescription>{t("noMatchesDescription")}</EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    ) : (
                        <>
                            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {projects.nodes.map((project) => (
                                    <li key={project.id}>
                                        <ProjectCard project={project} />
                                    </li>
                                ))}
                                {/* The last tile of the open projects, so only on their last page and not among search results */}
                                {currentView === "open" && !search && pagination.page === pageCount && (
                                    <li>
                                        <NewProjectCard />
                                    </li>
                                )}
                            </ul>
                            <ListPagination
                                pagination={pagination}
                                totalCount={projects.totalCount}
                                href={(otherPagination) => viewHref(currentView, otherPagination, search)}
                            />
                        </>
                    )}
                </PageContent>
            )}
        </>
    );
}
