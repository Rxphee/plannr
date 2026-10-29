import { PageContent } from "@src/components/layout/PageContent";
import { PageHeader } from "@src/components/layout/PageHeader";
import { PageIntro } from "@src/components/layout/PageIntro";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { notFound } from "next/navigation";

import { CreateEpicDialog } from "./CreateEpicDialog";
import { EpicCard } from "./EpicCard";
import { epicsPageQuery } from "./page.gql";
import type { GQLEpicsPageQuery, GQLEpicsPageQueryVariables } from "./page.gql.generated";

export default async function EpicsPage({ params }: PageProps<"/projects/[key]/epics">) {
    const { key } = await params;
    const { project } = await graphQLFetch<GQLEpicsPageQuery, GQLEpicsPageQueryVariables>(epicsPageQuery, { key });
    if (!project) {
        notFound();
    }

    return (
        <>
            <PageHeader
                breadcrumbs={[
                    { label: "Projects", href: "/projects" },
                    { label: project.name, href: `/projects/${project.key}` },
                    { label: "Epics" },
                ]}
            />
            <PageIntro
                title="Epics"
                description="Epics split the project into parts. Issues without another epic stay in General."
                actions={project.canContribute && <CreateEpicDialog projectId={project.id} />}
            />
            <PageContent>
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {project.epics.map((epic) => (
                        <li key={epic.id}>
                            <EpicCard projectKey={project.key} epic={epic} />
                        </li>
                    ))}
                </ul>
            </PageContent>
        </>
    );
}
