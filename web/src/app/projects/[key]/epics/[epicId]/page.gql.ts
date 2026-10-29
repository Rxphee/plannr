import { gql } from "@src/util/gql";

export const epicPageQuery = gql`
    query EpicPage($id: ID!) {
        epic(id: $id) {
            id
            name
            description
            isDefault
            issueCount
            doneIssueCount
            project {
                id
                key
                name
                canContribute
                canManage
                epics {
                    id
                    name
                }
            }
        }
    }
`;
