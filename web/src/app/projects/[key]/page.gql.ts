import { gql } from "@src/util/gql";

export const projectQuery = gql`
    query Project($key: String!) {
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
                }
            }
        }
    }
`;
