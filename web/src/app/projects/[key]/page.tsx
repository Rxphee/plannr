import { PageContent } from "@src/components/layout/PageContent";
import { Button } from "@src/components/ui/Button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@src/components/ui/Card";
import { UserAvatar } from "@src/components/UserAvatar";
import { graphQLFetch } from "@src/util/graphQLFetch";
import Link from "next/link";
import { notFound } from "next/navigation";

import { projectQuery } from "./page.gql";
import type { GQLProjectQuery, GQLProjectQueryVariables } from "./page.gql.generated";
import { projectMemberRoleLabels } from "./projectMemberRoles";

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
                    <CardTitle>Members</CardTitle>
                    {settingsLink("Manage")}
                </CardHeader>
                <CardContent>
                    <ul className="grid gap-3">
                        {project.members.map(({ role, user }) => (
                            <li key={user.id} className="flex items-center gap-3">
                                <UserAvatar user={user} />
                                <span className="flex-1 truncate font-medium">
                                    {user.firstName} {user.lastName}
                                </span>
                                <span className="text-muted-foreground text-sm">{projectMemberRoleLabels[role]}</span>
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </PageContent>
    );
}
