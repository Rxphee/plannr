import { gql } from "@src/util/gql";

export const labelsPageQuery = gql`
    query LabelsPage($offset: Int!, $limit: Int!) {
        canManageLabels
        labels(offset: $offset, limit: $limit) {
            totalCount
            nodes {
                id
                name
                color
            }
        }
    }
`;
