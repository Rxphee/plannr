import { gql } from "@src/util/gql";

export const createEpicMutation = gql`
    mutation CreateEpic($input: CreateEpicInput!) {
        createEpic(input: $input) {
            id
        }
    }
`;

export const updateEpicMutation = gql`
    mutation UpdateEpic($id: ID!, $input: UpdateEpicInput!) {
        updateEpic(id: $id, input: $input) {
            id
        }
    }
`;

export const deleteEpicMutation = gql`
    mutation DeleteEpic($id: ID!, $moveIssuesToEpicId: ID) {
        deleteEpic(id: $id, moveIssuesToEpicId: $moveIssuesToEpicId)
    }
`;
