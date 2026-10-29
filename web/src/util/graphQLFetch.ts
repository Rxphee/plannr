import "server-only";

type GraphQLResponse<TData> = { data?: TData; errors?: { message: string; extensions?: { code?: string } }[] };

export class GraphQLFetchError extends Error {
    // Error code of the API, e.g. BAD_REQUEST for input the user can correct
    readonly code: string | undefined;

    constructor(message: string, code?: string) {
        super(message);
        this.name = "GraphQLFetchError";
        this.code = code;
    }
}

// Server-side GraphQL request against the API. The client side gets its own solution once the first interactive views exist.
export async function graphQLFetch<TData, TVariables extends Record<string, unknown> = Record<string, never>>(
    query: string,
    variables?: TVariables,
): Promise<TData> {
    const apiUrl = process.env.API_URL;
    if (!apiUrl) {
        throw new Error("API_URL is not set");
    }

    const response = await fetch(`${apiUrl}/graphql`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query, variables }),
        cache: "no-store",
    });
    const { data, errors } = (await response.json()) as GraphQLResponse<TData>;
    if (errors?.length || !data) {
        throw new GraphQLFetchError(
            errors?.map(({ message }) => message).join("\n") ?? `GraphQL request failed with status ${response.status}`,
            errors?.[0]?.extensions?.code,
        );
    }
    return data;
}
