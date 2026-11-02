import { ListPagination } from "@src/components/ListPagination";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@src/components/ui/Empty";
import type { GQLLabelColor } from "@src/graphql.generated";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { toOffsetAndLimit } from "@src/util/pagination";
import { ListTodoIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { IssueFilters } from "./IssueFilters";
import { IssueList } from "./IssueList";
import { isIssueListFiltered, issueListHref, type IssueListParams, toIssueFilter, withinEpic } from "./issueListParams";
import { issueListQuery } from "./IssueListView.gql";
import type { GQLIssueListQuery, GQLIssueListQueryVariables } from "./IssueListView.gql.generated";

interface IssueListViewProps {
    project: { id: string; key: string; epics: { id: string; name: string }[] };
    // All labels, for the label filter
    labels: { id: string; name: string; color: GQLLabelColor }[];
    // The page the filters link to
    path: string;
    params: IssueListParams;
    // Shows only the issues of this epic, without the epic filter
    epicId?: string;
    // Fills the empty list, e.g. with the dialog for a new issue
    createAction?: ReactNode;
}

// The filters, the issues of the current page and the pagination, shared by the issue list and the page of an epic
export async function IssueListView({ project, labels, path, params, epicId, createAction }: IssueListViewProps) {
    const [{ issues }, t, tViews] = await Promise.all([
        graphQLFetch<GQLIssueListQuery, GQLIssueListQueryVariables>(issueListQuery, {
            projectId: project.id,
            view: params.view ?? null,
            filter: toIssueFilter(withinEpic(params, epicId)),
            sort: params.sort ?? null,
            ...toOffsetAndLimit(params),
        }),
        getTranslations("issues"),
        getTranslations("issueViews"),
    ]);
    const isFiltered = isIssueListFiltered(params);
    const { view } = params;

    return (
        <div className="grid gap-4">
            <IssueFilters path={path} params={params} epics={epicId ? undefined : project.epics} labels={labels} />
            {issues.nodes.length > 0 ? (
                <>
                    <IssueList projectKey={project.key} issues={issues.nodes} hideEpic={Boolean(epicId)} />
                    <ListPagination
                        pagination={params}
                        totalCount={issues.totalCount}
                        href={(pagination) => issueListHref(path, { ...params, ...pagination })}
                    />
                </>
            ) : (
                <Empty className="rounded-xl border border-dashed">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <ListTodoIcon />
                        </EmptyMedia>
                        {isFiltered ? (
                            <>
                                <EmptyTitle>{t("noMatchesTitle")}</EmptyTitle>
                                <EmptyDescription>{t("noMatchesDescription")}</EmptyDescription>
                            </>
                        ) : view ? (
                            <>
                                <EmptyTitle>{tViews(`${view}.emptyTitle`)}</EmptyTitle>
                                <EmptyDescription>{tViews(`${view}.emptyDescription`)}</EmptyDescription>
                            </>
                        ) : (
                            <>
                                <EmptyTitle>{t("noOpenTitle")}</EmptyTitle>
                                <EmptyDescription>{t("noOpenDescription")}</EmptyDescription>
                            </>
                        )}
                    </EmptyHeader>
                    {!isFiltered && !view && createAction && <EmptyContent>{createAction}</EmptyContent>}
                </Empty>
            )}
        </div>
    );
}
