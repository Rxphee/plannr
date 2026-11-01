import { PageContent } from "@src/components/layout/PageContent";
import { PageHeader } from "@src/components/layout/PageHeader";
import { PageIntro } from "@src/components/layout/PageIntro";
import { Button } from "@src/components/ui/Button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@src/components/ui/Empty";
import { fetchAllPages } from "@src/util/fetchAllPages";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { KeyRoundIcon, PlusIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { ApiTokenList } from "./ApiTokenList";
import { CreateApiTokenDialog } from "./CreateApiTokenDialog";
import { apiTokensPageQuery } from "./page.gql";
import type { GQLApiTokensPageQuery, GQLApiTokensPageQueryVariables } from "./page.gql.generated";

export default async function ApiTokensPage() {
    // A person has a few tokens at most, so they are shown in one list
    const [apiTokens, t] = await Promise.all([
        fetchAllPages(async (pagination) => {
            const data = await graphQLFetch<GQLApiTokensPageQuery, GQLApiTokensPageQueryVariables>(apiTokensPageQuery, pagination);
            return data.apiTokens;
        }),
        getTranslations("apiTokens"),
    ]);
    const newTokenButton = (
        <Button>
            <PlusIcon />
            {t("newToken")}
        </Button>
    );

    return (
        <>
            <PageHeader breadcrumbs={[{ label: t("title") }]} />
            <PageIntro title={t("title")} description={t("description")} actions={<CreateApiTokenDialog trigger={newTokenButton} />} />
            {apiTokens.length === 0 ? (
                <Empty className="flex-1">
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <KeyRoundIcon />
                        </EmptyMedia>
                        <EmptyTitle>{t("noTokensTitle")}</EmptyTitle>
                        <EmptyDescription>{t("noTokensDescription")}</EmptyDescription>
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
