import { PageContent } from "@src/components/layout/PageContent";
import { PageHeader } from "@src/components/layout/PageHeader";
import { PageIntro } from "@src/components/layout/PageIntro";
import { ListPagination } from "@src/components/ListPagination";
import { ListSearch } from "@src/components/ListSearch";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@src/components/ui/Empty";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { pageCountOf, type Pagination, paginationHref, parsePagination, toOffsetAndLimit } from "@src/util/pagination";
import { parseSearch } from "@src/util/search";
import { SearchXIcon } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { CreateEpicDialog } from "./CreateEpicDialog";
import { EpicCard } from "./EpicCard";
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
    const epicsHref = (otherPagination: Pagination) => paginationHref(`/projects/${project.key}/epics`, otherPagination, search ? { search } : {});
    const { epics } = await graphQLFetch<GQLEpicCardsQuery, GQLEpicCardsQueryVariables>(epicCardsQuery, {
        projectId: project.id,
        search,
        ...toOffsetAndLimit(pagination),
    });
    // A page behind the last one, e.g. after deleting epics, shows the last one instead
    const pageCount = pageCountOf(epics.totalCount, pagination);
    if (pagination.page > pageCount) {
        redirect(epicsHref({ ...pagination, page: pageCount }));
    }

    return (
        <>
            <PageHeader
                breadcrumbs={[
                    { label: "Projects", href: "/projects" },
                    { label: project.name, href: `/projects/${project.key}` },
                    { label: "Epics" },
                ]}
            />
            <PageIntro
                title="Epics"
                description="Epics split the project into parts. Issues without another epic stay in General."
                actions={project.canContribute && <CreateEpicDialog projectId={project.id} />}
            />
            <PageContent className="grid gap-6">
                <ListSearch placeholder="Search name" label="Search epics" />
                {epics.totalCount === 0 ? (
                    <Empty className="rounded-xl border border-dashed">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <SearchXIcon />
                            </EmptyMedia>
                            <EmptyTitle>No matching epics</EmptyTitle>
                            <EmptyDescription>Search for another name to see more epics.</EmptyDescription>
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
