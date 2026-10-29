import { gql } from "@src/util/gql";

export const projectQuery = gql`
    query Project($key: String!) {
        project(key: $key) {
            description
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
