"use server";

import type { GQLCreateIssueInput, GQLIssueLinkInput, GQLUpdateIssueInput } from "@src/graphql.generated";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { runMutation } from "@src/util/runMutation";
import { redirect } from "next/navigation";

import { addIssueLinkMutation, createIssueMutation, deleteIssueMutation, removeIssueLinkMutation, updateIssueMutation } from "./actions.gql";
import type {
    GQLAddIssueLinkMutation,
    GQLAddIssueLinkMutationVariables,
    GQLCreateIssueMutation,
    GQLCreateIssueMutationVariables,
    GQLDeleteIssueMutation,
    GQLDeleteIssueMutationVariables,
    GQLRemoveIssueLinkMutation,
    GQLRemoveIssueLinkMutationVariables,
    GQLUpdateIssueMutation,
    GQLUpdateIssueMutationVariables,
} from "./actions.gql.generated";

export async function createIssue(input: GQLCreateIssueInput): Promise<{ error?: string }> {
    return runMutation(() => graphQLFetch<GQLCreateIssueMutation, GQLCreateIssueMutationVariables>(createIssueMutation, { input }), {
        errorMessage: "The issue could not be created.",
    });
}

export async function updateIssue(id: string, input: GQLUpdateIssueInput): Promise<{ error?: string }> {
    return runMutation(() => graphQLFetch<GQLUpdateIssueMutation, GQLUpdateIssueMutationVariables>(updateIssueMutation, { id, input }), {
        errorMessage: "The issue could not be saved.",
    });
}

export async function deleteIssue(projectKey: string, id: string): Promise<{ error?: string }> {
    return runMutation(() => graphQLFetch<GQLDeleteIssueMutation, GQLDeleteIssueMutationVariables>(deleteIssueMutation, { id }), {
        errorMessage: "The issue could not be deleted.",
        onSuccess: () => redirect(`/projects/${projectKey}/issues`),
    });
}

export async function addIssueLink(input: GQLIssueLinkInput): Promise<{ error?: string }> {
    return runMutation(() => graphQLFetch<GQLAddIssueLinkMutation, GQLAddIssueLinkMutationVariables>(addIssueLinkMutation, { input }), {
        errorMessage: "The link could not be added.",
    });
}

export async function removeIssueLink(id: string): Promise<{ error?: string }> {
    return runMutation(() => graphQLFetch<GQLRemoveIssueLinkMutation, GQLRemoveIssueLinkMutationVariables>(removeIssueLinkMutation, { id }), {
        errorMessage: "The link could not be removed.",
    });
}
