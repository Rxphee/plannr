import { ViewTabs } from "@src/components/layout/ViewTabs";
import type { GQLIssueView } from "@src/graphql.generated";
import { graphQLFetch } from "@src/util/graphQLFetch";

import { issueListHref, type IssueListParams, openStatusesAmong, toIssueFilter, withView } from "./issueListParams";
import { issueViews } from "./issueViews";
import { issueViewCountsQuery } from "./IssueViewTabs.gql";
import type { GQLIssueViewCountsQuery, GQLIssueViewCountsQueryVariables } from "./IssueViewTabs.gql.generated";

interface IssueViewTabsProps {
    projectId: string;
    path: string;
    params: IssueListParams;
}

// "All" and the fixed views of the issue list, each with the number of issues it shows with the current filters
export async function IssueViewTabs({ projectId, path, params }: IssueViewTabsProps) {
    const counts = await graphQLFetch<GQLIssueViewCountsQuery, GQLIssueViewCountsQueryVariables>(issueViewCountsQuery, {
        projectId,
        filter: toIssueFilter(params),
        viewFilter: toIssueFilter({ ...params, statuses: openStatusesAmong(params.statuses) }),
    });
    const tabs: { view?: GQLIssueView; label: string; count: number }[] = [
        { label: "All", count: counts.all.totalCount },
        ...Object.entries(issueViews).map(([view, { label }]) => ({
            view: view as GQLIssueView,
            label,
            count: counts[view as GQLIssueView].totalCount,
        })),
    ];

    return (
        <ViewTabs
            tabs={tabs.map(({ view, label, count }) => ({
                label,
                href: issueListHref(path, withView(params, view)),
                count,
                isActive: view === params.view,
            }))}
        />
    );
}
