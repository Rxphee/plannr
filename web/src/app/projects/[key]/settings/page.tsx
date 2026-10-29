import { PageContent } from "@src/components/layout/PageContent";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { notFound } from "next/navigation";

import { AddProjectMemberDialog } from "./AddProjectMemberDialog";
import { DeleteProjectDialog } from "./DeleteProjectDialog";
import { EditProjectForm } from "./EditProjectForm";
import { projectSettingsQuery } from "./page.gql";
import type { GQLProjectSettingsQuery, GQLProjectSettingsQueryVariables } from "./page.gql.generated";
import { ProjectMemberList } from "./ProjectMemberList";
import { ProjectStatusActions } from "./ProjectStatusActions";
import { SettingsSection } from "./SettingsSection";

export default async function ProjectSettingsPage({ params }: PageProps<"/projects/[key]/settings">) {
    const { key } = await params;
    const { project, users } = await graphQLFetch<GQLProjectSettingsQuery, GQLProjectSettingsQueryVariables>(projectSettingsQuery, { key });
    if (!project?.canManage) {
        notFound();
    }

    const memberIds = new Set(project.members.map(({ user }) => user.id));
    const usersToAdd = users.filter((user) => !memberIds.has(user.id));

    return (
        <PageContent>
            <div className="max-w-4xl">
                <SettingsSection title="General" description="Name and description of the project.">
                    <EditProjectForm project={project} />
                </SettingsSection>

                <SettingsSection title="Members" description="Owners manage the project, members work on epics and issues, viewers only read.">
                    <div className="grid gap-3">
                        <ProjectMemberList project={project} />
                        <AddProjectMemberDialog projectId={project.id} users={usersToAdd} />
                    </div>
                </SettingsSection>

                <SettingsSection title="Status" description="Pause a project while it waits, archive it when it is done.">
                    <ProjectStatusActions project={project} />
                </SettingsSection>

                <SettingsSection title="Delete project" description="Deletes the project with everything in it. This cannot be undone.">
                    {project.status === "archived" ? (
                        <DeleteProjectDialog project={project} />
                    ) : (
                        <p className="text-muted-foreground text-sm">Archive the project first to delete it.</p>
                    )}
                </SettingsSection>
            </div>
        </PageContent>
    );
}
