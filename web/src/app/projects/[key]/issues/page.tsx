import { fetchLabelOptions } from "@src/app/labels/fetchLabelOptions";
import { PageContent } from "@src/components/layout/PageContent";
import { PageHeader } from "@src/components/layout/PageHeader";
import { PageIntro } from "@src/components/layout/PageIntro";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { notFound } from "next/navigation";

import { fetchEpicOptions } from "../epics/fetchEpicOptions";
import { CreateIssueDialog } from "./CreateIssueDialog";
import { parseIssueListParams } from "./issueListParams";
import { IssueListView } from "./IssueListView";
import { issuesPageQuery } from "./page.gql";
import type { GQLIssuesPageQuery, GQLIssuesPageQueryVariables } from "./page.gql.generated";

export default async function IssuesPage({ params, searchParams }: PageProps<"/projects/[key]/issues">) {
    const { key } = await params;
    const data = await graphQLFetch<GQLIssuesPageQuery, GQLIssuesPageQueryVariables>(issuesPageQuery, { key });
    if (!data.project) {
        notFound();
    }
    const [epics, labels] = await Promise.all([fetchEpicOptions(data.project.id), fetchLabelOptions()]);
    const project = { ...data.project, epics };

    const defaultEpic = project.epics.find((epic) => epic.isDefault);
    const createAction = project.canContribute && defaultEpic && <CreateIssueDialog project={project} epicId={defaultEpic.id} labels={labels} />;

    return (
        <>
            <PageHeader
                breadcrumbs={[
                    { label: "Projects", href: "/projects" },
                    { label: project.name, href: `/projects/${project.key}` },
                    { label: "Issues" },
                ]}
            />
            <PageIntro title="Issues" description={`The tasks and bugs of ${project.name}, newest first.`} actions={createAction} />
            <PageContent>
                <IssueListView
                    project={project}
                    labels={labels}
                    path={`/projects/${project.key}/issues`}
                    params={parseIssueListParams(await searchParams)}
                    createAction={createAction}
                />
            </PageContent>
        </>
    );
}
