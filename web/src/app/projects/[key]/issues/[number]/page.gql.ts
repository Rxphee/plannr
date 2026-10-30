import { gql } from "@src/util/gql";

export const issuePageQuery = gql`
    query IssuePage($key: String!) {
        issue(key: $key) {
            id
            key
            title
            type
            status
            priority
            dueDate
            description
            createdAt
            completedAt
            createdBy {
                id
                firstName
                lastName
            }
            epic {
                id
                name
            }
            labels {
                id
                name
                color
            }
            links {
                id
                url
                kind
            }
            project {
                id
                key
                name
                canContribute
                canManage
            }
        }
    }
`;
