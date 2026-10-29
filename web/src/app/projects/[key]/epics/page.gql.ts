import { gql } from "@src/util/gql";

export const epicsPageQuery = gql`
    query EpicsPage($key: String!) {
        project(key: $key) {
            id
            key
            name
            canContribute
        }
    }
`;

export const epicCardsQuery = gql`
    query EpicCards($projectId: ID!, $offset: Int!, $limit: Int!) {
        epics(projectId: $projectId, offset: $offset, limit: $limit) {
            totalCount
            nodes {
                id
                name
                description
                isDefault
                issueCount
                doneIssueCount
            }
        }
    }
`;
