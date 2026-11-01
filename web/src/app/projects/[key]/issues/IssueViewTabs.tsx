import { ViewTabs } from "@src/components/layout/ViewTabs";
import type { GQLIssueView } from "@src/graphql.generated";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { getTranslations } from "next-intl/server";

import { issueListHref, type IssueListParams, openStatusesAmong, toIssueFilter, withView } from "./issueListParams";
import { ISSUE_VIEWS } from "./issueViews";
import { issueViewCountsQuery } from "./IssueViewTabs.gql";
import type { GQLIssueViewCountsQuery, GQLIssueViewCountsQueryVariables } from "./IssueViewTabs.gql.generated";

interface IssueViewTabsProps {
    projectId: string;
    path: string;
    params: IssueListParams;
}

// "All" and the fixed views of the issue list, each with the number of issues it shows with the current filters
export async function IssueViewTabs({ projectId, path, params }: IssueViewTabsProps) {
    const [counts, t, tViews] = await Promise.all([
        graphQLFetch<GQLIssueViewCountsQuery, GQLIssueViewCountsQueryVariables>(issueViewCountsQuery, {
            projectId,
            filter: toIssueFilter(params),
            viewFilter: toIssueFilter({ ...params, statuses: openStatusesAmong(params.statuses) }),
        }),
        getTranslations("issues"),
        getTranslations("issueViews"),
    ]);
    const tabs: { view?: GQLIssueView; label: string; count: number }[] = [
        { label: t("allView"), count: counts.all.totalCount },
        ...ISSUE_VIEWS.map((view) => ({ view, label: tViews(`${view}.label`), count: counts[view].totalCount })),
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
