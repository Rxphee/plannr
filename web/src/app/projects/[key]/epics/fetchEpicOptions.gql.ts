import { gql } from "@src/util/gql";

export const epicOptionsQuery = gql`
    query EpicOptions($projectId: ID!, $offset: Int!, $limit: Int!) {
        epics(projectId: $projectId, offset: $offset, limit: $limit) {
            totalCount
            nodes {
                id
                name
                isDefault
            }
        }
    }
`;
