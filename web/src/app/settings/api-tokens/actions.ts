"use server";

import type { GQLCreateApiTokenInput } from "@src/graphql.generated";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { runMutation } from "@src/util/runMutation";

import { createApiTokenMutation, revokeApiTokenMutation } from "./actions.gql";
import type {
    GQLCreateApiTokenMutation,
    GQLCreateApiTokenMutationVariables,
    GQLRevokeApiTokenMutation,
    GQLRevokeApiTokenMutationVariables,
} from "./actions.gql.generated";

// Returns the token itself, which the API hands out only this once
export async function createApiToken(input: GQLCreateApiTokenInput): Promise<{ error?: string; token?: string }> {
    let token: string | undefined;
    const result = await runMutation(
        async () => {
            const data = await graphQLFetch<GQLCreateApiTokenMutation, GQLCreateApiTokenMutationVariables>(createApiTokenMutation, { input });
            token = data.createApiToken.token;
        },
        { errorMessage: "The API token could not be created." },
    );
    return { ...result, token };
}

export async function revokeApiToken(id: string): Promise<{ error?: string }> {
    return runMutation(() => graphQLFetch<GQLRevokeApiTokenMutation, GQLRevokeApiTokenMutationVariables>(revokeApiTokenMutation, { id }), {
        errorMessage: "The API token could not be revoked.",
    });
}
