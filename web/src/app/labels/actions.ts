"use server";

import type { GQLCreateLabelInput, GQLUpdateLabelInput } from "@src/graphql.generated";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { runMutation } from "@src/util/runMutation";
import { getTranslations } from "next-intl/server";

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
    const t = await getTranslations("errors");
    return runMutation(() => graphQLFetch<GQLCreateLabelMutation, GQLCreateLabelMutationVariables>(createLabelMutation, { input }), {
        errorMessage: t("createLabel"),
    });
}

export async function updateLabel(id: string, input: GQLUpdateLabelInput): Promise<{ error?: string }> {
    const t = await getTranslations("errors");
    return runMutation(() => graphQLFetch<GQLUpdateLabelMutation, GQLUpdateLabelMutationVariables>(updateLabelMutation, { id, input }), {
        errorMessage: t("saveLabel"),
    });
}

export async function deleteLabel(id: string): Promise<{ error?: string }> {
    const t = await getTranslations("errors");
    return runMutation(() => graphQLFetch<GQLDeleteLabelMutation, GQLDeleteLabelMutationVariables>(deleteLabelMutation, { id }), {
        errorMessage: t("deleteLabel"),
    });
}
