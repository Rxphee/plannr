import { PageContent } from "@src/components/layout/PageContent";
import { PageHeader } from "@src/components/layout/PageHeader";
import { PageIntro } from "@src/components/layout/PageIntro";
import { ListPagination } from "@src/components/ListPagination";
import { Button } from "@src/components/ui/Button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@src/components/ui/Empty";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { pageCountOf, paginationHref, parsePagination, toOffsetAndLimit } from "@src/util/pagination";
import { PencilIcon, PlusIcon, TagIcon } from "lucide-react";
import { redirect } from "next/navigation";

import { DeleteLabelDialog } from "./DeleteLabelDialog";
import { LabelBadge } from "./LabelBadge";
import { LabelDialog } from "./LabelDialog";
import { labelsPageQuery } from "./page.gql";
import type { GQLLabelsPageQuery, GQLLabelsPageQueryVariables } from "./page.gql.generated";

export default async function LabelsPage({ searchParams }: PageProps<"/labels">) {
    const pagination = parsePagination(await searchParams);
    const { labels, canManageLabels } = await graphQLFetch<GQLLabelsPageQuery, GQLLabelsPageQueryVariables>(
        labelsPageQuery,
        toOffsetAndLimit(pagination),
    );
    // A page behind the last one, e.g. after deleting labels, shows the last one instead
    const pageCount = pageCountOf(labels.totalCount, pagination);
    if (pagination.page > pageCount) {
        redirect(paginationHref("/labels", { ...pagination, page: pageCount }));
    }

    const createAction = canManageLabels && (
        <LabelDialog
            trigger={
                <Button>
                    <PlusIcon />
                    New label
                </Button>
            }
        />
    );

    return (
        <>
            <PageHeader breadcrumbs={[{ label: "Labels" }]} />
            <PageIntro
                title="Labels"
                description="Labels tag issues across all projects, e.g. upstream for bugs in third-party code. Admins manage them."
                actions={createAction}
            />
            <PageContent className="grid gap-4">
                {labels.totalCount === 0 ? (
                    <Empty className="rounded-xl border border-dashed">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <TagIcon />
                            </EmptyMedia>
                            <EmptyTitle>No labels yet</EmptyTitle>
                            <EmptyDescription>
                                {canManageLabels
                                    ? "Create the first label, then pick it on any issue."
                                    : "Admins create the labels for all projects."}
                            </EmptyDescription>
                        </EmptyHeader>
                        {createAction && <EmptyContent>{createAction}</EmptyContent>}
                    </Empty>
                ) : (
                    <>
                        <ul className="bg-card ring-foreground/10 divide-y overflow-hidden rounded-xl shadow-xs ring-1">
                            {labels.nodes.map((label) => (
                                <li key={label.id} className="flex min-h-12 items-center gap-2 px-4 py-2">
                                    <span className="flex min-w-0 flex-1">
                                        <LabelBadge label={label} className="max-w-full" />
                                    </span>
                                    {canManageLabels && (
                                        <>
                                            <LabelDialog
                                                label={label}
                                                trigger={
                                                    <Button variant="ghost" size="icon-sm" aria-label={`Edit ${label.name}`} title="Edit label">
                                                        <PencilIcon />
                                                    </Button>
                                                }
                                            />
                                            <DeleteLabelDialog label={label} />
                                        </>
                                    )}
                                </li>
                            ))}
                        </ul>
                        <ListPagination
                            pagination={pagination}
                            totalCount={labels.totalCount}
                            href={(otherPagination) => paginationHref("/labels", otherPagination)}
                        />
                    </>
                )}
            </PageContent>
        </>
    );
}
