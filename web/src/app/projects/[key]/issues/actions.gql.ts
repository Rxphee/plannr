import { gql } from "@src/util/gql";

export const createIssueMutation = gql`
    mutation CreateIssue($input: CreateIssueInput!) {
        createIssue(input: $input) {
            id
        }
    }
`;

export const updateIssueMutation = gql`
    mutation UpdateIssue($id: ID!, $input: UpdateIssueInput!) {
        updateIssue(id: $id, input: $input) {
            id
        }
    }
`;

export const deleteIssueMutation = gql`
    mutation DeleteIssue($id: ID!) {
        deleteIssue(id: $id)
    }
`;

export const addIssueLinkMutation = gql`
    mutation AddIssueLink($input: IssueLinkInput!) {
        addIssueLink(input: $input) {
            id
        }
    }
`;

export const removeIssueLinkMutation = gql`
    mutation RemoveIssueLink($id: ID!) {
        removeIssueLink(id: $id)
    }
`;
