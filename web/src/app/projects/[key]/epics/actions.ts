"use server";

import type { GQLCreateEpicInput, GQLUpdateEpicInput } from "@src/graphql.generated";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { runMutation } from "@src/util/runMutation";
import { redirect } from "next/navigation";

import { createEpicMutation, deleteEpicMutation, updateEpicMutation } from "./actions.gql";
import type {
    GQLCreateEpicMutation,
    GQLCreateEpicMutationVariables,
    GQLDeleteEpicMutation,
    GQLDeleteEpicMutationVariables,
    GQLUpdateEpicMutation,
    GQLUpdateEpicMutationVariables,
} from "./actions.gql.generated";

export async function createEpic(input: GQLCreateEpicInput): Promise<{ error?: string }> {
    return runMutation(() => graphQLFetch<GQLCreateEpicMutation, GQLCreateEpicMutationVariables>(createEpicMutation, { input }), {
        errorMessage: "The epic could not be created.",
    });
}

export async function updateEpic(id: string, input: GQLUpdateEpicInput): Promise<{ error?: string }> {
    return runMutation(() => graphQLFetch<GQLUpdateEpicMutation, GQLUpdateEpicMutationVariables>(updateEpicMutation, { id, input }), {
        errorMessage: "The epic could not be saved.",
    });
}

// Without moveIssuesToEpicId the issues of the epic are deleted with it
export async function deleteEpic(projectKey: string, variables: GQLDeleteEpicMutationVariables): Promise<{ error?: string }> {
    return runMutation(() => graphQLFetch<GQLDeleteEpicMutation, GQLDeleteEpicMutationVariables>(deleteEpicMutation, variables), {
        errorMessage: "The epic could not be deleted.",
        onSuccess: () => redirect(`/projects/${projectKey}/epics`),
    });
}
