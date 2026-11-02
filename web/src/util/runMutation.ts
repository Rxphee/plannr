import "server-only";

import { refresh } from "next/cache";

import { GraphQLFetchError } from "./graphQLFetch";
import { translateApiError } from "./translateApiError";

interface RunMutationOptions {
    errorMessage: string;
    // Called outside the try block, so it may redirect
    onSuccess?: () => void | Promise<void>;
}

// For actions whose caller navigates away and confirms with a toast: a refresh would render the page of what was just deleted,
// and a redirect in the action would never return to the caller
export function skipRefresh(): void {}

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
            return { error: await translateApiError(error) };
        }
        console.error(error);
        return { error: errorMessage };
    }

    await onSuccess();
    return {};
}
