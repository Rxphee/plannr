import { gql } from "@src/util/gql";

export const projectsQuery = gql`
    query Projects($statuses: [ProjectStatus!]!, $offset: Int!, $limit: Int!) {
        projects(statuses: $statuses, offset: $offset, limit: $limit) {
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
        # Only the counts for the view tabs
        open: projects(statuses: [active, paused], limit: 1) {
            totalCount
        }
        archived: projects(statuses: [archived], limit: 1) {
            totalCount
        }
        all: projects(limit: 1) {
            totalCount
        }
    }
`;
