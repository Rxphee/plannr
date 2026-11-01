import { gql } from "@src/util/gql";

export const assigneeMembersQuery = gql`
    query AssigneeMembers($key: String!, $offset: Int!, $limit: Int!) {
        project(key: $key) {
            members(offset: $offset, limit: $limit) {
                totalCount
                nodes {
                    user {
                        id
                        firstName
                        lastName
                    }
                }
            }
        }
    }
`;

export const assigneeAdminsQuery = gql`
    query AssigneeAdmins($key: String!) {
        project(key: $key) {
            adminsWithoutMembership {
                id
                firstName
                lastName
            }
        }
    }
`;
