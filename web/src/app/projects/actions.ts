"use server";

import type { GQLCreateProjectInput } from "@src/graphql.generated";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { runMutation } from "@src/util/runMutation";
import { getTranslations } from "next-intl/server";

import { createProjectMutation } from "./actions.gql";
import type { GQLCreateProjectMutation, GQLCreateProjectMutationVariables } from "./actions.gql.generated";

export async function createProject(input: GQLCreateProjectInput): Promise<{ error?: string }> {
    const t = await getTranslations("errors");
    return runMutation(() => graphQLFetch<GQLCreateProjectMutation, GQLCreateProjectMutationVariables>(createProjectMutation, { input }), {
        errorMessage: t("createProject"),
    });
}
