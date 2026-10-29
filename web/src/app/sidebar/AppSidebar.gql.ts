import { gql } from "@src/util/gql";

export const sidebarProjectsQuery = gql`
    query SidebarProjects($offset: Int!, $limit: Int!) {
        projects(offset: $offset, limit: $limit) {
            totalCount
            nodes {
                id
                key
                name
                status
                canManage
            }
        }
    }
`;
