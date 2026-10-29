import { gql } from "@src/util/gql";

export const projectsQuery = gql`
    query Projects {
        projects {
            id
            key
            name
            description
            status
            createdAt
            members {
                user {
                    id
                    firstName
                    lastName
                }
            }
        }
    }
`;
