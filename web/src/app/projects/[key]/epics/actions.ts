"use server";

import type { GQLCreateEpicInput, GQLUpdateEpicInput } from "@src/graphql.generated";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { runMutation, skipRefresh } from "@src/util/runMutation";
import { getTranslations } from "next-intl/server";

import { createEpicMutation, deleteEpicMutation, updateEpicMutation } from "./actions.gql";
import type {
    GQLCreateEpicMutation,
    GQLCreateEpicMutationVariables,
    GQLDeleteEpicMutation,
    GQLDeleteEpicMutationVariables,
    GQLUpdateEpicMutation,
    GQLUpdateEpicMutationVariables,
} from "./actions.gql.generated";

// Returns the ID of the new epic, so a toast can link to it
export async function createEpic(input: GQLCreateEpicInput): Promise<{ error?: string; epicId?: string }> {
    const t = await getTranslations("errors");
    let epicId: string | undefined;
    const result = await runMutation(
        async () => {
            const data = await graphQLFetch<GQLCreateEpicMutation, GQLCreateEpicMutationVariables>(createEpicMutation, { input });
            epicId = data.createEpic.id;
        },
        { errorMessage: t("createEpic") },
    );
    return { ...result, epicId };
}

export async function updateEpic(id: string, input: GQLUpdateEpicInput): Promise<{ error?: string }> {
    const t = await getTranslations("errors");
    return runMutation(() => graphQLFetch<GQLUpdateEpicMutation, GQLUpdateEpicMutationVariables>(updateEpicMutation, { id, input }), {
        errorMessage: t("saveEpic"),
    });
}

// Without moveIssuesToEpicId the issues of the epic are deleted with it
export async function deleteEpic(variables: GQLDeleteEpicMutationVariables): Promise<{ error?: string }> {
    const t = await getTranslations("errors");
    return runMutation(() => graphQLFetch<GQLDeleteEpicMutation, GQLDeleteEpicMutationVariables>(deleteEpicMutation, variables), {
        errorMessage: t("deleteEpic"),
        onSuccess: skipRefresh,
    });
}
