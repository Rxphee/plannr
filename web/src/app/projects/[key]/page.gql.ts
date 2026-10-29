import { gql } from "@src/util/gql";

export const projectQuery = gql`
    query Project($key: String!) {
        project(key: $key) {
            key
            name
            description
            status
            canManage
            createdAt
        }
    }
`;

export const projectMembersQuery = gql`
    query ProjectMembers($key: String!, $offset: Int!, $limit: Int!) {
        project(key: $key) {
            members(offset: $offset, limit: $limit) {
                totalCount
                nodes {
                    role
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
