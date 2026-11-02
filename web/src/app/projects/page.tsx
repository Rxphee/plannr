import { PageContent } from "@src/components/layout/PageContent";
import { PageHeader } from "@src/components/layout/PageHeader";
import { PageIntro } from "@src/components/layout/PageIntro";
import { ViewTabs } from "@src/components/layout/ViewTabs";
import { ListPagination } from "@src/components/ListPagination";
import { ListSearch } from "@src/components/ListSearch";
import { ListSort } from "@src/components/ListSort";
import { Button } from "@src/components/ui/Button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@src/components/ui/Empty";
import type { GQLProjectSortField, GQLProjectStatus } from "@src/graphql.generated";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { pageCountOf, type Pagination, paginationHref, parsePagination, toOffsetAndLimit } from "@src/util/pagination";
import { parseSearch } from "@src/util/search";
import { parseSort, type Sort, sortParam } from "@src/util/sort";
import { FolderKanbanIcon, PlusIcon, SearchXIcon } from "lucide-react";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { CreateProjectDialog } from "./CreateProjectDialog";
import { NewProjectCard } from "./NewProjectCard";
import { projectsQuery } from "./page.gql";
import type { GQLProjectsQuery, GQLProjectsQueryVariables } from "./page.gql.generated";
import { ProjectCard } from "./ProjectCard";
import { DEFAULT_PROJECT_SORT, PROJECT_SORT_FIELDS } from "./projectSort";

const views = {
    open: { statuses: ["active", "paused"] },
    archived: { statuses: ["archived"] },
    all: { statuses: ["active", "paused", "archived"] },
} satisfies Record<string, { statuses: GQLProjectStatus[] }>;

type View = keyof typeof views;

function isView(value: unknown): value is View {
    return typeof value === "string" && value in views;
}

interface ListParams {
    search?: string;
    sort?: Sort<GQLProjectSortField>;
}

function viewHref(view: View, pagination: Pagination, { search, sort }: ListParams): string {
    return paginationHref("/projects", pagination, {
        ...(view !== "open" && { view }),
        ...(search && { search }),
        ...(sort && { sort: sortParam(sort) }),
    });
}

export default async function ProjectsPage({ searchParams }: PageProps<"/projects">) {
    const resolvedSearchParams = await searchParams;
    const currentView: View = isView(resolvedSearchParams.view) ? resolvedSearchParams.view : "open";
    const pagination = parsePagination(resolvedSearchParams);
    const search = parseSearch(resolvedSearchParams);
    const sort = parseSort(resolvedSearchParams, PROJECT_SORT_FIELDS);
    const [{ projects, ...counts }, t, tCommon] = await Promise.all([
        graphQLFetch<GQLProjectsQuery, GQLProjectsQueryVariables>(projectsQuery, {
            statuses: views[currentView].statuses,
            search,
            sort,
            ...toOffsetAndLimit(pagination),
        }),
        getTranslations("projects"),
        getTranslations("common"),
    ]);
    // A page behind the last one, e.g. after archiving projects, shows the last one instead
    const pageCount = pageCountOf(projects.totalCount, pagination);
    if (pagination.page > pageCount) {
        redirect(viewHref(currentView, { ...pagination, page: pageCount }, { search, sort }));
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
                            // Another view starts on its first page, with the same page size, search and sort
                            href: viewHref(view, { ...pagination, page: 1 }, { search, sort }),
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
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <ListSearch placeholder={t("searchPlaceholder")} label={t("searchLabel")} />
                        <ListSort fields={PROJECT_SORT_FIELDS} defaultSort={DEFAULT_PROJECT_SORT} />
                    </div>
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
                            <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(21rem,100%),1fr))] gap-4">
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
                                href={(otherPagination) => viewHref(currentView, otherPagination, { search, sort })}
                            />
                        </>
                    )}
                </PageContent>
            )}
        </>
    );
}
