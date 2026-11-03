import "server-only";

import { apiFetch } from "./apiFetch";

// The values of an input error, e.g. the key that is already taken
export type ApiErrorParams = Record<string, string | number | string[]>;

interface ApiErrorExtensions {
    // Error code of the API, e.g. BAD_REQUEST for input the user can correct
    code?: string;
    // Why the input was refused, for input errors the web app can translate (like UserErrorReason in api/src/common/user-error.ts)
    reason?: string;
    params?: ApiErrorParams;
}

type GraphQLResponse<TData> = { data?: TData; errors?: { message: string; extensions?: ApiErrorExtensions }[] };

export class GraphQLFetchError extends Error {
    readonly code: string | undefined;
    readonly reason: string | undefined;
    readonly params: ApiErrorParams;

    constructor(message: string, { code, reason, params = {} }: ApiErrorExtensions = {}) {
        super(message);
        this.name = "GraphQLFetchError";
        this.code = code;
        this.reason = reason;
        this.params = params;
    }
}

// Server-side GraphQL request against the API. The client side gets its own solution once the first interactive views exist.
export async function graphQLFetch<TData, TVariables extends Record<string, unknown> = Record<string, never>>(
    query: string,
    variables?: TVariables,
): Promise<TData> {
    const response = await apiFetch("/graphql", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query, variables }),
    });
    const { data, errors } = (await response.json()) as GraphQLResponse<TData>;
    if (errors?.length || !data) {
        throw new GraphQLFetchError(
            errors?.map(({ message }) => message).join("\n") ?? `GraphQL request failed with status ${response.status}`,
            errors?.[0]?.extensions,
        );
    }
    return data;
}
