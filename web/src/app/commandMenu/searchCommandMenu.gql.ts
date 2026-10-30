import { gql } from "@src/util/gql";

export const commandMenuSearchQuery = gql`
    query CommandMenuSearch($search: String!) {
        projects(statuses: [active, paused], search: $search, limit: 5) {
            nodes {
                id
                key
                name
            }
        }
        issues(filter: { search: $search }, limit: 8) {
            nodes {
                id
                key
                number
                title
                type
                status
                project {
                    key
                    name
                }
            }
        }
    }
`;
