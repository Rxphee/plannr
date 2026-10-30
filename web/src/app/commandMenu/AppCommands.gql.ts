import { gql } from "@src/util/gql";

export const quickCaptureProjectsQuery = gql`
    query QuickCaptureProjects($offset: Int!, $limit: Int!) {
        projects(statuses: [active, paused], offset: $offset, limit: $limit) {
            totalCount
            nodes {
                id
                key
                name
                canContribute
            }
        }
    }
`;
