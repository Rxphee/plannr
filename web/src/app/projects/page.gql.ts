import { gql } from "@src/util/gql";

export const projectsQuery = gql`
    query Projects($statuses: [ProjectStatus!]!, $search: String, $offset: Int!, $limit: Int!) {
        projects(statuses: $statuses, search: $search, offset: $offset, limit: $limit) {
            totalCount
            nodes {
                id
                key
                name
                description
                status
                createdAt
                # As many as ProjectCard shows avatars
                members(limit: 4) {
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
        # Only the counts for the view tabs, with the same search
        open: projects(statuses: [active, paused], search: $search, limit: 1) {
            totalCount
        }
        archived: projects(statuses: [archived], search: $search, limit: 1) {
            totalCount
        }
        all: projects(search: $search, limit: 1) {
            totalCount
        }
    }
`;
