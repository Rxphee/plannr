import { Button } from "@src/components/ui/button";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { ExternalLinkIcon } from "lucide-react";
import { connection } from "next/server";

import { apiStatusQuery } from "./page.gql";
import type { GQLApiStatusQuery } from "./page.gql.generated";

export default async function HomePage() {
    // Render on every request, the API is not reachable at build time
    await connection();
    const { status } = await graphQLFetch<GQLApiStatusQuery>(apiStatusQuery);

    return (
        <main className="flex min-h-svh flex-col items-center justify-center gap-4">
            <h1 className="font-heading text-3xl font-semibold">Plannr</h1>
            <p className="text-muted-foreground text-sm">API: {status}</p>
            {process.env.NODE_ENV === "development" && (
                <Button
                    variant="outline"
                    nativeButton={false}
                    render={<a href={`${process.env.API_URL}/graphql`} target="_blank" rel="noreferrer" />}
                >
                    GraphiQL
                    <ExternalLinkIcon />
                </Button>
            )}
        </main>
    );
}
