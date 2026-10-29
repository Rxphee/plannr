import "server-only";

import { refresh } from "next/cache";

import { GraphQLFetchError } from "./graphQLFetch";

interface RunMutationOptions {
    errorMessage: string;
    // Called outside the try block, so it may redirect
    onSuccess?: () => void | Promise<void>;
}

// Runs the mutation of a Server Action and refreshes the page afterwards, or calls onSuccess instead.
// Only messages for input the user can correct are shown, everything else stays in the server log.
export async function runMutation(
    mutate: () => Promise<unknown>,
    { errorMessage, onSuccess = refresh }: RunMutationOptions,
): Promise<{ error?: string }> {
    try {
        await mutate();
    } catch (error) {
        if (error instanceof GraphQLFetchError && error.code === "BAD_REQUEST") {
            return { error: error.message };
        }
        console.error(error);
        return { error: errorMessage };
    }

    await onSuccess();
    return {};
}
