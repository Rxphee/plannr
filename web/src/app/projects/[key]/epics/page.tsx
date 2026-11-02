import { PageContent } from "@src/components/layout/PageContent";
import { PageHeader } from "@src/components/layout/PageHeader";
import { PageIntro } from "@src/components/layout/PageIntro";
import { ListPagination } from "@src/components/ListPagination";
import { ListSearch } from "@src/components/ListSearch";
import { ListSort } from "@src/components/ListSort";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@src/components/ui/Empty";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { pageCountOf, type Pagination, paginationHref, parsePagination, toOffsetAndLimit } from "@src/util/pagination";
import { parseSearch } from "@src/util/search";
import { parseSort, sortParam } from "@src/util/sort";
import { SearchXIcon } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { CreateEpicDialog } from "./CreateEpicDialog";
import { EpicCard } from "./EpicCard";
import { DEFAULT_EPIC_SORT, EPIC_SORT_FIELDS } from "./epicSort";
import { epicCardsQuery, epicsPageQuery } from "./page.gql";
import type { GQLEpicCardsQuery, GQLEpicCardsQueryVariables, GQLEpicsPageQuery, GQLEpicsPageQueryVariables } from "./page.gql.generated";

export default async function EpicsPage({ params, searchParams }: PageProps<"/projects/[key]/epics">) {
    const { key } = await params;
    const { project } = await graphQLFetch<GQLEpicsPageQuery, GQLEpicsPageQueryVariables>(epicsPageQuery, { key });
    if (!project) {
        notFound();
    }
    const resolvedSearchParams = await searchParams;
    const pagination = parsePagination(resolvedSearchParams);
    const search = parseSearch(resolvedSearchParams);
    const sort = parseSort(resolvedSearchParams, EPIC_SORT_FIELDS);
    const epicsHref = (otherPagination: Pagination) =>
        paginationHref(`/projects/${project.key}/epics`, otherPagination, { ...(search && { search }), ...(sort && { sort: sortParam(sort) }) });
    const [{ epics }, t, tCommon, tSidebar] = await Promise.all([
        graphQLFetch<GQLEpicCardsQuery, GQLEpicCardsQueryVariables>(epicCardsQuery, {
            projectId: project.id,
            search,
            sort,
            ...toOffsetAndLimit(pagination),
        }),
        getTranslations("epics"),
        getTranslations("common"),
        getTranslations("sidebar"),
    ]);
    // A page behind the last one, e.g. after deleting epics, shows the last one instead
    const pageCount = pageCountOf(epics.totalCount, pagination);
    if (pagination.page > pageCount) {
        redirect(epicsHref({ ...pagination, page: pageCount }));
    }

    return (
        <>
            <PageHeader
                breadcrumbs={[
                    { label: tCommon("projects"), href: "/projects" },
                    { label: project.name, href: `/projects/${project.key}` },
                    { label: tSidebar("epics") },
                ]}
            />
            <PageIntro
                title={tSidebar("epics")}
                description={t("description")}
                actions={project.canContribute && <CreateEpicDialog project={project} />}
            />
            <PageContent className="grid gap-6">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <ListSearch placeholder={t("searchPlaceholder")} label={t("searchLabel")} />
                    <ListSort fields={EPIC_SORT_FIELDS} defaultSort={DEFAULT_EPIC_SORT} />
                </div>
                {epics.totalCount === 0 ? (
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
                            {epics.nodes.map((epic) => (
                                <li key={epic.id}>
                                    <EpicCard projectKey={project.key} epic={epic} />
                                </li>
                            ))}
                        </ul>
                        <ListPagination pagination={pagination} totalCount={epics.totalCount} href={epicsHref} />
                    </>
                )}
            </PageContent>
        </>
    );
}
