import { gql } from "@src/util/gql";

// Only the counts of the tabs, with the filters of the list
export const issueViewCountsQuery = gql`
    query IssueViewCounts($projectId: ID!, $filter: IssueFilter, $viewFilter: IssueFilter) {
        all: issues(projectId: $projectId, filter: $filter, limit: 1) {
            totalCount
        }
        focus: issues(projectId: $projectId, view: focus, filter: $viewFilter, limit: 1) {
            totalCount
        }
        due: issues(projectId: $projectId, view: due, filter: $viewFilter, limit: 1) {
            totalCount
        }
        bugs: issues(projectId: $projectId, view: bugs, filter: $viewFilter, limit: 1) {
            totalCount
        }
        pullRequests: issues(projectId: $projectId, view: pullRequests, filter: $viewFilter, limit: 1) {
            totalCount
        }
    }
`;
