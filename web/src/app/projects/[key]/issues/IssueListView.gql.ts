import { gql } from "@src/util/gql";

export const issueListQuery = gql`
    query IssueList($projectId: ID!, $view: IssueView, $filter: IssueFilter, $offset: Int!, $limit: Int!) {
        issues(projectId: $projectId, view: $view, filter: $filter, offset: $offset, limit: $limit) {
            totalCount
            nodes {
                id
                key
                number
                title
                type
                status
                priority
                dueDate
                epic {
                    id
                    name
                }
                assignee {
                    id
                    firstName
                    lastName
                }
                labels {
                    id
                    name
                    color
                }
                links {
                    kind
                }
            }
        }
    }
`;
