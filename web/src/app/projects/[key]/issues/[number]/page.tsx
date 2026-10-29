import { PageContent } from "@src/components/layout/PageContent";
import { PageHeader } from "@src/components/layout/PageHeader";
import { PageIntro } from "@src/components/layout/PageIntro";
import { RichTextEditor } from "@src/components/richText/RichTextEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@src/components/ui/Card";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { CalendarCheckIcon, CalendarIcon } from "lucide-react";
import { notFound } from "next/navigation";

import { fetchEpicOptions } from "../../epics/fetchEpicOptions";
import { IssueStatusBadge } from "../IssueStatusBadge";
import { IssueTypeIcon } from "../IssueTypeIcon";
import { DeleteIssueDialog } from "./DeleteIssueDialog";
import { EditIssueTitleDialog } from "./EditIssueTitleDialog";
import { IssueDescriptionForm } from "./IssueDescriptionForm";
import { IssueLinks } from "./IssueLinks";
import { IssueProperties } from "./IssueProperties";
import { issuePageQuery } from "./page.gql";
import type { GQLIssuePageQuery, GQLIssuePageQueryVariables } from "./page.gql.generated";

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export default async function IssuePage({ params }: PageProps<"/projects/[key]/issues/[number]">) {
    const { key, number } = await params;
    if (!/^[1-9]\d*$/.test(number)) {
        notFound();
    }
    const { issue } = await graphQLFetch<GQLIssuePageQuery, GQLIssuePageQueryVariables>(issuePageQuery, { key: `${key}-${number}` });
    if (!issue) {
        notFound();
    }

    const project = { ...issue.project, epics: await fetchEpicOptions(issue.project.id) };

    return (
        <>
            <PageHeader
                breadcrumbs={[
                    { label: "Projects", href: "/projects" },
                    { label: project.name, href: `/projects/${project.key}` },
                    { label: "Issues", href: `/projects/${project.key}/issues` },
                    { label: issue.key },
                ]}
            />
            <PageIntro
                title={issue.title}
                icon={<IssueTypeIcon type={issue.type} className="mt-1.5 size-6" />}
                badge={<IssueStatusBadge status={issue.status} />}
                meta={
                    <>
                        <span className="font-mono">{issue.key}</span>
                        <span className="flex items-center gap-1">
                            <CalendarIcon className="size-4" />
                            Created by {issue.createdBy.firstName} {issue.createdBy.lastName} on {dateFormat.format(new Date(issue.createdAt))}
                        </span>
                        {issue.completedAt && (
                            <span className="flex items-center gap-1">
                                <CalendarCheckIcon className="size-4" />
                                {issue.status === "canceled" ? "Canceled" : "Done"} on {dateFormat.format(new Date(issue.completedAt))}
                            </span>
                        )}
                    </>
                }
                actions={
                    <>
                        {project.canContribute && <EditIssueTitleDialog issue={issue} />}
                        {project.canManage && <DeleteIssueDialog projectKey={project.key} issue={issue} />}
                    </>
                }
            />
            <PageContent className="grid items-start gap-4 lg:grid-cols-[1fr_20rem]">
                <Card>
                    <CardHeader>
                        <CardTitle>Description</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {project.canContribute ? (
                            <IssueDescriptionForm issue={issue} />
                        ) : issue.description ? (
                            <RichTextEditor value={issue.description} readOnly />
                        ) : (
                            <p className="text-muted-foreground">No description.</p>
                        )}
                    </CardContent>
                </Card>
                <div className="grid grid-cols-1 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <IssueProperties issue={issue} project={project} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Links</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <IssueLinks issue={issue} canEdit={project.canContribute} />
                        </CardContent>
                    </Card>
                </div>
            </PageContent>
        </>
    );
}
