"use server";

import type { GQLCreateLabelInput, GQLUpdateLabelInput } from "@src/graphql.generated";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { runMutation } from "@src/util/runMutation";

import { createLabelMutation, deleteLabelMutation, updateLabelMutation } from "./actions.gql";
import type {
    GQLCreateLabelMutation,
    GQLCreateLabelMutationVariables,
    GQLDeleteLabelMutation,
    GQLDeleteLabelMutationVariables,
    GQLUpdateLabelMutation,
    GQLUpdateLabelMutationVariables,
} from "./actions.gql.generated";

export async function createLabel(input: GQLCreateLabelInput): Promise<{ error?: string }> {
    return runMutation(() => graphQLFetch<GQLCreateLabelMutation, GQLCreateLabelMutationVariables>(createLabelMutation, { input }), {
        errorMessage: "The label could not be created.",
    });
}

export async function updateLabel(id: string, input: GQLUpdateLabelInput): Promise<{ error?: string }> {
    return runMutation(() => graphQLFetch<GQLUpdateLabelMutation, GQLUpdateLabelMutationVariables>(updateLabelMutation, { id, input }), {
        errorMessage: "The label could not be saved.",
    });
}

export async function deleteLabel(id: string): Promise<{ error?: string }> {
    return runMutation(() => graphQLFetch<GQLDeleteLabelMutation, GQLDeleteLabelMutationVariables>(deleteLabelMutation, { id }), {
        errorMessage: "The label could not be deleted.",
    });
}
