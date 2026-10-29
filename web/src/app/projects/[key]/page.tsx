import { PageContent } from "@src/components/layout/PageContent";
import { Button } from "@src/components/ui/Button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@src/components/ui/Card";
import { graphQLFetch } from "@src/util/graphQLFetch";
import Link from "next/link";
import { notFound } from "next/navigation";

import { projectQuery } from "./page.gql";
import type { GQLProjectQuery, GQLProjectQueryVariables } from "./page.gql.generated";
import { ProjectMemberOverview } from "./ProjectMemberOverview";

export default async function ProjectPage({ params }: PageProps<"/projects/[key]">) {
    const { key } = await params;
    const { project } = await graphQLFetch<GQLProjectQuery, GQLProjectQueryVariables>(projectQuery, { key });
    if (!project) {
        notFound();
    }

    const settingsLink = (label: string) =>
        project.canManage && (
            <CardAction className="row-span-1">
                <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/projects/${project.key}/settings`} />}>
                    {label}
                </Button>
            </CardAction>
        );

    return (
        <PageContent className="grid gap-4 lg:grid-cols-[1fr_20rem]">
            <Card>
                <CardHeader className="items-center">
                    <CardTitle>About</CardTitle>
                    {settingsLink("Edit")}
                </CardHeader>
                <CardContent>
                    {project.description ? (
                        <p className="text-base whitespace-pre-line">{project.description}</p>
                    ) : (
                        <p className="text-muted-foreground">
                            No description yet. Describe the goal of the project, so everyone knows what it is about.
                        </p>
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="items-center">
                    <CardTitle className="flex items-center gap-2">
                        Members
                        <span className="bg-muted text-muted-foreground rounded-md px-1.5 text-xs tabular-nums">{project.members.length}</span>
                    </CardTitle>
                    {settingsLink("Manage")}
                </CardHeader>
                <CardContent>
                    <ProjectMemberOverview members={project.members} />
                </CardContent>
            </Card>
        </PageContent>
    );
}
