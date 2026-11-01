"use server";

import type { GQLCreateIssueInput, GQLIssueLinkInput, GQLUpdateIssueInput } from "@src/graphql.generated";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { runMutation } from "@src/util/runMutation";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

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
    const t = await getTranslations("errors");
    return runMutation(() => graphQLFetch<GQLCreateIssueMutation, GQLCreateIssueMutationVariables>(createIssueMutation, { input }), {
        errorMessage: t("createIssue"),
    });
}

export async function updateIssue(id: string, input: GQLUpdateIssueInput): Promise<{ error?: string }> {
    const t = await getTranslations("errors");
    return runMutation(() => graphQLFetch<GQLUpdateIssueMutation, GQLUpdateIssueMutationVariables>(updateIssueMutation, { id, input }), {
        errorMessage: t("saveIssue"),
    });
}

export async function deleteIssue(projectKey: string, id: string): Promise<{ error?: string }> {
    const t = await getTranslations("errors");
    return runMutation(() => graphQLFetch<GQLDeleteIssueMutation, GQLDeleteIssueMutationVariables>(deleteIssueMutation, { id }), {
        errorMessage: t("deleteIssue"),
        onSuccess: () => redirect(`/projects/${projectKey}/issues`),
    });
}

export async function addIssueLink(input: GQLIssueLinkInput): Promise<{ error?: string }> {
    const t = await getTranslations("errors");
    return runMutation(() => graphQLFetch<GQLAddIssueLinkMutation, GQLAddIssueLinkMutationVariables>(addIssueLinkMutation, { input }), {
        errorMessage: t("addLink"),
    });
}

export async function removeIssueLink(id: string): Promise<{ error?: string }> {
    const t = await getTranslations("errors");
    return runMutation(() => graphQLFetch<GQLRemoveIssueLinkMutation, GQLRemoveIssueLinkMutationVariables>(removeIssueLinkMutation, { id }), {
        errorMessage: t("removeLink"),
    });
}
