import { gql } from "@src/util/gql";

export const epicsPageQuery = gql`
    query EpicsPage($key: String!) {
        project(key: $key) {
            id
            key
            name
            canContribute
            epics {
                id
                name
                description
                isDefault
                issueCount
                doneIssueCount
            }
        }
    }
`;
