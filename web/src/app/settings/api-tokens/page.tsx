import { PageContent } from "@src/components/layout/PageContent";
import { PageHeader } from "@src/components/layout/PageHeader";
import { PageIntro } from "@src/components/layout/PageIntro";
import { Button } from "@src/components/ui/Button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@src/components/ui/Empty";
import { fetchAllPages } from "@src/util/fetchAllPages";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { KeyRoundIcon, PlusIcon } from "lucide-react";

import { ApiTokenList } from "./ApiTokenList";
import { CreateApiTokenDialog } from "./CreateApiTokenDialog";
import { apiTokensPageQuery } from "./page.gql";
import type { GQLApiTokensPageQuery, GQLApiTokensPageQueryVariables } from "./page.gql.generated";

export default async function ApiTokensPage() {
    // A person has a few tokens at most, so they are shown in one list
    const apiTokens = await fetchAllPages(async (pagination) => {
        const data = await graphQLFetch<GQLApiTokensPageQuery, GQLApiTokensPageQueryVariables>(apiTokensPageQuery, pagination);
        return data.apiTokens;
    });
    const newTokenButton = (
        <Button>
            <PlusIcon />
            New token
        </Button>
    );

    return (
        <>
            <PageHeader breadcrumbs={[{ label: "API tokens" }]} />
            <PageIntro
                title="API tokens"
                description="Personal tokens let scripts and AI agents like Claude Code use Plannr as you, e.g. through the API or MCP."
                actions={<CreateApiTokenDialog trigger={newTokenButton} />}
            />
            {apiTokens.length === 0 ? (
                <Empty className="flex-1">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <KeyRoundIcon />
                        </EmptyMedia>
                        <EmptyTitle>No API tokens yet</EmptyTitle>
                        <EmptyDescription>
                            Create a token for each tool that should work with Plannr, so you can revoke them one by one.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <CreateApiTokenDialog trigger={newTokenButton} />
                    </EmptyContent>
                </Empty>
            ) : (
                <PageContent>
                    <div className="max-w-4xl">
                        <ApiTokenList apiTokens={apiTokens} />
                    </div>
                </PageContent>
            )}
        </>
    );
}
