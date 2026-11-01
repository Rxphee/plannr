"use server";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { runMutation } from "@src/util/runMutation";
import { getTranslations } from "next-intl/server";

import { setUserAdminMutation } from "./actions.gql";
import type { GQLSetUserAdminMutation, GQLSetUserAdminMutationVariables } from "./actions.gql.generated";

export async function setUserAdmin(input: GQLSetUserAdminMutationVariables): Promise<{ error?: string }> {
    const t = await getTranslations("errors");
    return runMutation(() => graphQLFetch<GQLSetUserAdminMutation, GQLSetUserAdminMutationVariables>(setUserAdminMutation, input), {
        errorMessage: input.isAdmin ? t("makeAdmin") : t("removeAdmin"),
    });
}
