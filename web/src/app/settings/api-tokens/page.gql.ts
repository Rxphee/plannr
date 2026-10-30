import { gql } from "@src/util/gql";

export const apiTokensPageQuery = gql`
    query ApiTokensPage($offset: Int!, $limit: Int!) {
        apiTokens(offset: $offset, limit: $limit) {
            totalCount
            nodes {
                id
                name
                prefix
                createdAt
                expiresAt
                lastUsedAt
            }
        }
    }
`;
