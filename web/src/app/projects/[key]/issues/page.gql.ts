import { gql } from "@src/util/gql";

export const issuesPageQuery = gql`
    query IssuesPage($key: String!) {
        project(key: $key) {
            id
            key
            name
            canContribute
        }
    }
`;
