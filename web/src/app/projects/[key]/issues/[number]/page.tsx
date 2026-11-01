import { fetchLabelOptions } from "@src/app/labels/fetchLabelOptions";
import { PageContent } from "@src/components/layout/PageContent";
import { PageHeader } from "@src/components/layout/PageHeader";
import { PageIntro } from "@src/components/layout/PageIntro";
import { RichTextEditor } from "@src/components/richText/RichTextEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@src/components/ui/Card";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { CalendarCheckIcon, CalendarIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { getFormatter, getTranslations } from "next-intl/server";

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

export default async function IssuePage({ params }: PageProps<"/projects/[key]/issues/[number]">) {
    const { key, number } = await params;
    if (!/^[1-9]\d*$/.test(number)) {
        notFound();
    }
    const { issue } = await graphQLFetch<GQLIssuePageQuery, GQLIssuePageQueryVariables>(issuePageQuery, { key: `${key}-${number}` });
    if (!issue) {
        notFound();
    }

    const [epics, labels, t, tCommon, tSidebar, format] = await Promise.all([
        fetchEpicOptions(issue.project.id),
        fetchLabelOptions(),
        getTranslations("issue"),
        getTranslations("common"),
        getTranslations("sidebar"),
        getFormatter(),
    ]);
    const project = { ...issue.project, epics };

    return (
        <>
            <PageHeader
                breadcrumbs={[
                    { label: tCommon("projects"), href: "/projects" },
                    { label: project.name, href: `/projects/${project.key}` },
                    { label: tSidebar("issues"), href: `/projects/${project.key}/issues` },
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
                            {t("createdBy", {
                                name: `${issue.createdBy.firstName} ${issue.createdBy.lastName}`,
                                date: format.dateTime(new Date(issue.createdAt), "date"),
                            })}
                        </span>
                        {issue.completedAt && (
                            <span className="flex items-center gap-1">
                                <CalendarCheckIcon className="size-4" />
                                {t(issue.status === "canceled" ? "canceledOn" : "doneOn", {
                                    date: format.dateTime(new Date(issue.completedAt), "date"),
                                })}
                            </span>
                        )}
                    </>
                }
                actions={
                    project.canContribute && (
                        <>
                            <EditIssueTitleDialog issue={issue} />
                            {project.canManage && <DeleteIssueDialog projectKey={project.key} issue={issue} />}
                        </>
                    )
                }
            />
            <PageContent className="grid items-start gap-4 lg:grid-cols-[1fr_20rem]">
                <Card>
                    <CardHeader>
                        <CardTitle>{t("description")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {project.canContribute ? (
                            <IssueDescriptionForm issue={issue} />
                        ) : issue.description ? (
                            <RichTextEditor value={issue.description} readOnly />
                        ) : (
                            <p className="text-muted-foreground">{t("noDescription")}</p>
                        )}
                    </CardContent>
                </Card>
                <div className="grid grid-cols-1 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("details")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <IssueProperties issue={issue} project={project} labels={labels} />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>{t("links")}</CardTitle>
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
