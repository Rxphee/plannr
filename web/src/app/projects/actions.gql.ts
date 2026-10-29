import { gql } from "@src/util/gql";

export const createProjectMutation = gql`
    mutation CreateProject($input: CreateProjectInput!) {
        createProject(input: $input) {
            id
        }
    }
`;
