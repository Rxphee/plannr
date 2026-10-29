import { gql } from "@src/util/gql";

export const sidebarProjectsQuery = gql`
    query SidebarProjects {
        projects {
            id
            key
            name
            status
            canManage
        }
    }
`;
