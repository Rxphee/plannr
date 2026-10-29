"use server";

import type { GQLCreateProjectInput } from "@src/graphql.generated";
import { graphQLFetch, GraphQLFetchError } from "@src/util/graphQLFetch";
import { refresh } from "next/cache";

import { createProjectMutation } from "./actions.gql";
import type { GQLCreateProjectMutation, GQLCreateProjectMutationVariables } from "./actions.gql.generated";

export async function createProject(input: GQLCreateProjectInput): Promise<{ error?: string }> {
    try {
        await graphQLFetch<GQLCreateProjectMutation, GQLCreateProjectMutationVariables>(createProjectMutation, { input });
    } catch (error) {
        // Only messages for input the user can correct are shown, everything else stays in the server log
        if (error instanceof GraphQLFetchError && error.code === "BAD_REQUEST") {
            return { error: error.message };
        }
        console.error(error);

        return {
            error: "The project could not be created.",
        };
    }

    refresh();
    return {};
}
