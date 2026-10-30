import { ListPagination } from "@src/components/ListPagination";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@src/components/ui/Empty";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { toOffsetAndLimit } from "@src/util/pagination";
import { ListTodoIcon } from "lucide-react";
import type { ReactNode } from "react";

import { IssueFilters } from "./IssueFilters";
import { IssueList } from "./IssueList";
import { isIssueListFiltered, issueListHref, type IssueListParams, toIssueFilter } from "./issueListParams";
import { issueListQuery } from "./IssueListView.gql";
import type { GQLIssueListQuery, GQLIssueListQueryVariables } from "./IssueListView.gql.generated";
import { issueViews } from "./issueViews";

interface IssueListViewProps {
    project: { id: string; key: string; epics: { id: string; name: string }[] };
    // The page the filters link to
    path: string;
    params: IssueListParams;
    // Shows only the issues of this epic, without the epic filter
    epicId?: string;
    // Fills the empty list, e.g. with the dialog for a new issue
    createAction?: ReactNode;
}

// The filters, the issues of the current page and the pagination, shared by the issue list and the page of an epic
export async function IssueListView({ project, path, params, epicId, createAction }: IssueListViewProps) {
    const { issues } = await graphQLFetch<GQLIssueListQuery, GQLIssueListQueryVariables>(issueListQuery, {
        projectId: project.id,
        view: params.view ?? null,
        filter: toIssueFilter(epicId ? { ...params, epics: [epicId] } : params),
        ...toOffsetAndLimit(params),
    });
    const isFiltered = isIssueListFiltered(params);
    const view = params.view && issueViews[params.view];

    return (
        <div className="grid gap-4">
            <IssueFilters path={path} params={params} epics={epicId ? undefined : project.epics} />
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
                                <EmptyTitle>No matching issues</EmptyTitle>
                                <EmptyDescription>Change the filters or the search to see more issues.</EmptyDescription>
                            </>
                        ) : view ? (
                            <>
                                <EmptyTitle>{view.emptyTitle}</EmptyTitle>
                                <EmptyDescription>{view.emptyDescription}</EmptyDescription>
                            </>
                        ) : (
                            <>
                                <EmptyTitle>No open issues</EmptyTitle>
                                <EmptyDescription>
                                    Issues are the tasks and bugs of the project. Done ones are under the status filter.
                                </EmptyDescription>
                            </>
                        )}
                    </EmptyHeader>
                    {!isFiltered && !view && createAction && <EmptyContent>{createAction}</EmptyContent>}
                </Empty>
            )}
        </div>
    );
}
