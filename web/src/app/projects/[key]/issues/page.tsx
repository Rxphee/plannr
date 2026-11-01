import { fetchLabelOptions } from "@src/app/labels/fetchLabelOptions";
import { PageContent } from "@src/components/layout/PageContent";
import { PageHeader } from "@src/components/layout/PageHeader";
import { PageIntro } from "@src/components/layout/PageIntro";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { fetchEpicOptions } from "../epics/fetchEpicOptions";
import { CreateIssueDialog } from "./CreateIssueDialog";
import { parseIssueListParams } from "./issueListParams";
import { IssueListView } from "./IssueListView";
import { IssueViewTabs } from "./IssueViewTabs";
import { issuesPageQuery } from "./page.gql";
import type { GQLIssuesPageQuery, GQLIssuesPageQueryVariables } from "./page.gql.generated";

export default async function IssuesPage({ params, searchParams }: PageProps<"/projects/[key]/issues">) {
    const { key } = await params;
    const data = await graphQLFetch<GQLIssuesPageQuery, GQLIssuesPageQueryVariables>(issuesPageQuery, { key });
    if (!data.project) {
        notFound();
    }
    const [epics, labels, t, tCommon] = await Promise.all([
        fetchEpicOptions(data.project.id),
        fetchLabelOptions(),
        getTranslations("issues"),
        getTranslations("common"),
    ]);
    const project = { ...data.project, epics };
    const path = `/projects/${project.key}/issues`;
    const listParams = parseIssueListParams(await searchParams);

    const defaultEpic = project.epics.find((epic) => epic.isDefault);
    const createAction = project.canContribute && defaultEpic && <CreateIssueDialog project={project} epicId={defaultEpic.id} labels={labels} />;

    return (
        <>
            <PageHeader
                breadcrumbs={[
                    { label: tCommon("projects"), href: "/projects" },
                    { label: project.name, href: `/projects/${project.key}` },
                    { label: t("title") },
                ]}
            />
            <PageIntro
                title={t("title")}
                description={t(listParams.view === "due" ? "descriptionDue" : "descriptionNewest", { project: project.name })}
                actions={createAction}
                tabs={<IssueViewTabs projectId={project.id} path={path} params={listParams} />}
            />
            <PageContent>
                <IssueListView project={project} labels={labels} path={path} params={listParams} createAction={createAction} />
            </PageContent>
        </>
    );
}
