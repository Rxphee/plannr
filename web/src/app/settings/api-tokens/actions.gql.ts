import { gql } from "@src/util/gql";

export const createApiTokenMutation = gql`
    mutation CreateApiToken($input: CreateApiTokenInput!) {
        createApiToken(input: $input) {
            token
        }
    }
`;

export const revokeApiTokenMutation = gql`
    mutation RevokeApiToken($id: ID!) {
        revokeApiToken(id: $id)
    }
`;
