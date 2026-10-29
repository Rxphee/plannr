import { gql } from "@src/util/gql";

export const projectSettingsQuery = gql`
    query ProjectSettings($key: String!) {
        project(key: $key) {
            id
            key
            name
            description
            status
            canManage
            members {
                role
                user {
                    id
                    firstName
                    lastName
                    email
                }
            }
        }
        users {
            id
            firstName
            lastName
        }
    }
`;
