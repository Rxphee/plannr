import { PageContent } from "@src/components/layout/PageContent";
import { PageHeader } from "@src/components/layout/PageHeader";
import { PageIntro } from "@src/components/layout/PageIntro";
import { ListPagination } from "@src/components/ListPagination";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { pageCountOf, paginationHref, parsePagination, toOffsetAndLimit } from "@src/util/pagination";
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
    const pagination = parsePagination(await searchParams);
    const path = `/projects/${project.key}/epics`;
    const { epics } = await graphQLFetch<GQLEpicCardsQuery, GQLEpicCardsQueryVariables>(epicCardsQuery, {
        projectId: project.id,
        ...toOffsetAndLimit(pagination),
    });
    // A page behind the last one, e.g. after deleting epics, shows the last one instead
    const pageCount = pageCountOf(epics.totalCount, pagination);
    if (pagination.page > pageCount) {
        redirect(paginationHref(path, { ...pagination, page: pageCount }));
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
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {epics.nodes.map((epic) => (
                        <li key={epic.id}>
                            <EpicCard projectKey={project.key} epic={epic} />
                        </li>
                    ))}
                </ul>
                <ListPagination
                    pagination={pagination}
                    totalCount={epics.totalCount}
                    href={(otherPagination) => paginationHref(path, otherPagination)}
                />
            </PageContent>
        </>
    );
}
