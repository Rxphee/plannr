import { PageContent } from "@src/components/layout/PageContent";
import { PageHeader } from "@src/components/layout/PageHeader";
import { PageIntro } from "@src/components/layout/PageIntro";
import { ListPagination } from "@src/components/ListPagination";
import { fetchAllPages } from "@src/util/fetchAllPages";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { pageCountOf, paginationHref, parsePagination, toOffsetAndLimit } from "@src/util/pagination";
import { notFound, redirect } from "next/navigation";

import { AddProjectMemberDialog } from "./AddProjectMemberDialog";
import { DeleteProjectDialog } from "./DeleteProjectDialog";
import { EditProjectForm } from "./EditProjectForm";
import { projectMemberIdsQuery, projectSettingsQuery, projectSettingsUsersQuery } from "./page.gql";
import type {
    GQLProjectMemberIdsQuery,
    GQLProjectMemberIdsQueryVariables,
    GQLProjectSettingsQuery,
    GQLProjectSettingsQueryVariables,
    GQLProjectSettingsUsersQuery,
    GQLProjectSettingsUsersQueryVariables,
} from "./page.gql.generated";
import { ProjectMemberList } from "./ProjectMemberList";
import { ProjectStatusActions } from "./ProjectStatusActions";
import { SettingsSection } from "./SettingsSection";

export default async function ProjectSettingsPage({ params, searchParams }: PageProps<"/projects/[key]/settings">) {
    const { key } = await params;
    // The page of the member list
    const memberPagination = parsePagination(await searchParams);
    const { offset: memberOffset, limit: memberLimit } = toOffsetAndLimit(memberPagination);
    const { project } = await graphQLFetch<GQLProjectSettingsQuery, GQLProjectSettingsQueryVariables>(projectSettingsQuery, {
        key,
        memberOffset,
        memberLimit,
    });
    if (!project?.canManage) {
        notFound();
    }
    const path = `/projects/${project.key}/settings`;
    // A page behind the last one, e.g. after removing members, shows the last one instead
    const memberPageCount = pageCountOf(project.members.totalCount, memberPagination);
    if (memberPagination.page > memberPageCount) {
        redirect(paginationHref(path, { ...memberPagination, page: memberPageCount }));
    }
    const users = await fetchAllPages(async (pagination) => {
        const data = await graphQLFetch<GQLProjectSettingsUsersQuery, GQLProjectSettingsUsersQueryVariables>(projectSettingsUsersQuery, pagination);
        return data.users;
    });

    // Of all members, not only the ones on this page, so the dialog offers only users outside the project
    const members = await fetchAllPages(async (pagination) => {
        const data = await graphQLFetch<GQLProjectMemberIdsQuery, GQLProjectMemberIdsQueryVariables>(projectMemberIdsQuery, { key, ...pagination });
        return data.project?.members ?? { nodes: [], totalCount: 0 };
    });
    const memberIds = new Set(members.map(({ user }) => user.id));
    const usersToAdd = users.filter((user) => !memberIds.has(user.id));

    return (
        <>
            <PageHeader
                breadcrumbs={[
                    { label: "Projects", href: "/projects" },
                    { label: project.name, href: `/projects/${project.key}` },
                    { label: "Settings" },
                ]}
            />
            <PageIntro title="Settings" description={`Name, members and status of ${project.name}.`} />
            <PageContent>
                <div className="max-w-4xl">
                    <SettingsSection title="General" description="Name and description of the project.">
                        <EditProjectForm project={project} />
                    </SettingsSection>

                    <SettingsSection title="Members" description="Owners manage the project, members work on epics and issues, viewers only read.">
                        <div className="grid gap-3">
                            <ProjectMemberList project={{ ...project, members: project.members.nodes }} />
                            <ListPagination
                                pagination={memberPagination}
                                totalCount={project.members.totalCount}
                                href={(pagination) => paginationHref(path, pagination)}
                            />
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
        </>
    );
}
