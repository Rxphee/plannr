import { gql } from "@src/util/gql";

export const createLabelMutation = gql`
    mutation CreateLabel($input: CreateLabelInput!) {
        createLabel(input: $input) {
            id
        }
    }
`;

export const updateLabelMutation = gql`
    mutation UpdateLabel($id: ID!, $input: UpdateLabelInput!) {
        updateLabel(id: $id, input: $input) {
            id
        }
    }
`;

export const deleteLabelMutation = gql`
    mutation DeleteLabel($id: ID!) {
        deleteLabel(id: $id)
    }
`;
