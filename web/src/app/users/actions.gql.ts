import { gql } from "@src/util/gql";

export const setUserAdminMutation = gql`
    mutation SetUserAdmin($id: ID!, $isAdmin: Boolean!) {
        setUserAdmin(id: $id, isAdmin: $isAdmin) {
            id
        }
    }
`;
