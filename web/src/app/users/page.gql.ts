import { gql } from "@src/util/gql";

export const usersPageQuery = gql`
    query UsersPage($search: String, $offset: Int!, $limit: Int!) {
        canAppointAdmins
        users(search: $search, offset: $offset, limit: $limit) {
            totalCount
            nodes {
                id
                firstName
                lastName
                email
                instanceRole
            }
        }
    }
`;
