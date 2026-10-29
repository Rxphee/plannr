import { graphQLFetch } from "@src/util/graphQLFetch";
import { ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AddProjectMemberDialog } from "./AddProjectMemberDialog";
import { DeleteProjectDialog } from "./DeleteProjectDialog";
import { EditProjectForm } from "./EditProjectForm";
import { projectSettingsQuery } from "./page.gql";
import type { GQLProjectSettingsQuery, GQLProjectSettingsQueryVariables } from "./page.gql.generated";
import { ProjectMemberList } from "./ProjectMemberList";
import { ProjectStatusActions } from "./ProjectStatusActions";

export default async function ProjectSettingsPage({ params }: PageProps<"/projects/[key]/settings">) {
    const { key } = await params;
    const { project, users } = await graphQLFetch<GQLProjectSettingsQuery, GQLProjectSettingsQueryVariables>(projectSettingsQuery, { key });
    if (!project?.canManage) {
        notFound();
    }

    const memberIds = new Set(project.members.map(({ user }) => user.id));
    const usersToAdd = users.filter((user) => !memberIds.has(user.id));

    return (
        <main className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-10">
            <div className="grid gap-2">
                <Link href={`/projects/${project.key}`} className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 text-sm">
                    <ArrowLeftIcon className="size-4" />
                    {project.name}
                </Link>
                <h1 className="font-heading text-2xl font-semibold">Settings</h1>
            </div>

            <section className="grid gap-4">
                <h2 className="font-heading text-lg font-semibold">General</h2>
                <EditProjectForm project={project} />
            </section>

            <section className="grid gap-4">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="font-heading text-lg font-semibold">Members</h2>
                    <AddProjectMemberDialog projectId={project.id} users={usersToAdd} />
                </div>
                <ProjectMemberList project={project} />
            </section>

            <section className="grid gap-4">
                <h2 className="font-heading text-lg font-semibold">Status</h2>
                <ProjectStatusActions project={project} />
            </section>

            <section className="grid gap-4">
                <h2 className="font-heading text-lg font-semibold">Delete project</h2>
                {project.status === "archived" ? (
                    <DeleteProjectDialog project={project} />
                ) : (
                    <p className="text-muted-foreground text-sm">Only archived projects can be deleted.</p>
                )}
            </section>
        </main>
    );
}
