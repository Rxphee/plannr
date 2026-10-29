import { gql } from "@src/util/gql";

export const projectLayoutQuery = gql`
    query ProjectLayout($key: String!) {
        project(key: $key) {
            key
            name
            status
            canManage
        }
    }
`;
