import { gql } from "@src/util/gql";

export const projectQuery = gql`
    query Project($key: String!) {
        project(key: $key) {
            key
            description
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
