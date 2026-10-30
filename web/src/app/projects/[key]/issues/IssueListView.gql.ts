import { gql } from "@src/util/gql";

export const issueListQuery = gql`
    query IssueList($projectId: ID!, $filter: IssueFilter, $offset: Int!, $limit: Int!) {
        issues(projectId: $projectId, filter: $filter, offset: $offset, limit: $limit) {
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
