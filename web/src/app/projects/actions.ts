"use server";

import type { GQLCreateProjectInput } from "@src/graphql.generated";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { runMutation } from "@src/util/runMutation";

import { createProjectMutation } from "./actions.gql";
import type { GQLCreateProjectMutation, GQLCreateProjectMutationVariables } from "./actions.gql.generated";

export async function createProject(input: GQLCreateProjectInput): Promise<{ error?: string }> {
    return runMutation(() => graphQLFetch<GQLCreateProjectMutation, GQLCreateProjectMutationVariables>(createProjectMutation, { input }), {
        errorMessage: "The project could not be created.",
    });
}
