import { PageContent } from "@src/components/layout/PageContent";
import { PageHeader } from "@src/components/layout/PageHeader";
import { PageIntro } from "@src/components/layout/PageIntro";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { notFound } from "next/navigation";

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
    const project = { ...data.project, epics: await fetchEpicOptions(data.project.id) };
    const path = `/projects/${project.key}/issues`;
    const listParams = parseIssueListParams(await searchParams);

    const defaultEpic = project.epics.find((epic) => epic.isDefault);
    const createAction = project.canContribute && defaultEpic && <CreateIssueDialog project={project} epicId={defaultEpic.id} />;

    return (
        <>
            <PageHeader
                breadcrumbs={[
                    { label: "Projects", href: "/projects" },
                    { label: project.name, href: `/projects/${project.key}` },
                    { label: "Issues" },
                ]}
            />
            <PageIntro
                title="Issues"
                description={`The tasks and bugs of ${project.name}, ${listParams.view === "due" ? "the soonest due first" : "newest first"}.`}
                actions={createAction}
                tabs={<IssueViewTabs projectId={project.id} path={path} params={listParams} />}
            />
            <PageContent>
                <IssueListView project={project} path={path} params={listParams} createAction={createAction} />
            </PageContent>
        </>
    );
}
