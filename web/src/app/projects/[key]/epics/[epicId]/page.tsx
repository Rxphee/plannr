import { fetchLabelOptions } from "@src/app/labels/fetchLabelOptions";
import { PageContent } from "@src/components/layout/PageContent";
import { PageHeader } from "@src/components/layout/PageHeader";
import { PageIntro } from "@src/components/layout/PageIntro";
import { RichTextEditor } from "@src/components/richText/RichTextEditor";
import { Badge } from "@src/components/ui/Badge";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { CreateIssueDialog } from "../../issues/CreateIssueDialog";
import { parseIssueListParams } from "../../issues/issueListParams";
import { IssueListView } from "../../issues/IssueListView";
import { EpicProgress } from "../EpicProgress";
import { fetchEpicOptions } from "../fetchEpicOptions";
import { DeleteEpicDialog } from "./DeleteEpicDialog";
import { EditEpicDialog } from "./EditEpicDialog";
import { epicPageQuery } from "./page.gql";
import type { GQLEpicPageQuery, GQLEpicPageQueryVariables } from "./page.gql.generated";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function EpicPage({ params, searchParams }: PageProps<"/projects/[key]/epics/[epicId]">) {
    const { key, epicId } = await params;
    // The API refuses IDs that are no UUID, so they end up here as a missing page
    if (!UUID_PATTERN.test(epicId)) {
        notFound();
    }
    const { epic } = await graphQLFetch<GQLEpicPageQuery, GQLEpicPageQueryVariables>(epicPageQuery, { id: epicId });
    if (!epic || epic.project.key !== key) {
        notFound();
    }

    const [epics, labels, t, tCommon, tSidebar] = await Promise.all([
        fetchEpicOptions(epic.project.id),
        fetchLabelOptions(),
        getTranslations("epics"),
        getTranslations("common"),
        getTranslations("sidebar"),
    ]);
    const project = { ...epic.project, epics };
    const path = `/projects/${project.key}/epics/${epic.id}`;
    const createAction = project.canContribute && <CreateIssueDialog project={project} epicId={epic.id} labels={labels} />;

    return (
        <>
            <PageHeader
                breadcrumbs={[
                    { label: tCommon("projects"), href: "/projects" },
                    { label: project.name, href: `/projects/${project.key}` },
                    { label: tSidebar("epics"), href: `/projects/${project.key}/epics` },
                    { label: epic.name },
                ]}
            />
            <PageIntro
                title={epic.name}
                badge={
                    epic.isDefault && (
                        <Badge variant="outline" className="text-muted-foreground">
                            {tCommon("default")}
                        </Badge>
                    )
                }
                meta={<EpicProgress epic={epic} className="w-full max-w-sm" />}
                actions={
                    project.canContribute && (
                        <>
                            {createAction}
                            <EditEpicDialog epic={epic} />
                            {project.canManage && !epic.isDefault && (
                                <DeleteEpicDialog
                                    projectKey={project.key}
                                    epic={epic}
                                    otherEpics={project.epics.filter((otherEpic) => otherEpic.id !== epic.id)}
                                />
                            )}
                        </>
                    )
                }
            />
            <PageContent className="grid gap-6">
                {epic.description ? (
                    <RichTextEditor value={epic.description} readOnly className="max-w-3xl" />
                ) : (
                    epic.isDefault && <p className="text-muted-foreground text-sm">{t("defaultEpicDescription")}</p>
                )}
                <IssueListView
                    project={project}
                    labels={labels}
                    path={path}
                    params={parseIssueListParams(await searchParams)}
                    epicId={epic.id}
                    createAction={createAction}
                />
            </PageContent>
        </>
    );
}
