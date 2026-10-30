"use server";

import { graphQLFetch } from "@src/util/graphQLFetch";
import { runMutation } from "@src/util/runMutation";

import { setUserAdminMutation } from "./actions.gql";
import type { GQLSetUserAdminMutation, GQLSetUserAdminMutationVariables } from "./actions.gql.generated";

export async function setUserAdmin(input: GQLSetUserAdminMutationVariables): Promise<{ error?: string }> {
    return runMutation(() => graphQLFetch<GQLSetUserAdminMutation, GQLSetUserAdminMutationVariables>(setUserAdminMutation, input), {
        errorMessage: input.isAdmin ? "The user could not be made an admin." : "The admin rights could not be removed.",
    });
}
