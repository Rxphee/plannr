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
            members {
                role
                user {
                    id
                    firstName
                    lastName
                }
            }
        }
    }
`;
