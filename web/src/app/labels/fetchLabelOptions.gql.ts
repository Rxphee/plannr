import { gql } from "@src/util/gql";

export const labelOptionsQuery = gql`
    query LabelOptions($offset: Int!, $limit: Int!) {
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
