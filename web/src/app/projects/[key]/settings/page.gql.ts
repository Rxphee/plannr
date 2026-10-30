import { gql } from "@src/util/gql";

export const projectSettingsQuery = gql`
    query ProjectSettings($key: String!, $memberSearch: String, $memberOffset: Int!, $memberLimit: Int!) {
        project(key: $key) {
            id
            key
            name
            description
            status
            canManage
            members(search: $memberSearch, offset: $memberOffset, limit: $memberLimit) {
                totalCount
                nodes {
                    role
                    user {
                        id
                        firstName
                        lastName
                        email
                    }
                }
            }
        }
    }
`;

export const projectSettingsUsersQuery = gql`
    query ProjectSettingsUsers($offset: Int!, $limit: Int!) {
        users(offset: $offset, limit: $limit) {
            totalCount
            nodes {
                id
                firstName
                lastName
            }
        }
    }
`;

export const projectMemberIdsQuery = gql`
    query ProjectMemberIds($key: String!, $offset: Int!, $limit: Int!) {
        project(key: $key) {
            members(offset: $offset, limit: $limit) {
                totalCount
                nodes {
                    user {
                        id
                    }
                }
            }
        }
    }
`;
