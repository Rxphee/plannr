import { PageContent } from "@src/components/layout/PageContent";
import { PageHeader } from "@src/components/layout/PageHeader";
import { PageIntro } from "@src/components/layout/PageIntro";
import { ListPagination } from "@src/components/ListPagination";
import { ListSearch } from "@src/components/ListSearch";
import { fetchAllPages } from "@src/util/fetchAllPages";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { pageCountOf, type Pagination, paginationHref, parsePagination, toOffsetAndLimit } from "@src/util/pagination";
import { parseSearch } from "@src/util/search";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { AddProjectMembersDialog } from "./AddProjectMembersDialog";
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
import { ProjectAdminAccessList } from "./ProjectAdminAccessList";
import { ProjectExportButton } from "./ProjectExportButton";
import { ProjectMemberList } from "./ProjectMemberList";
import { ProjectStatusActions } from "./ProjectStatusActions";
import { SettingsSection } from "./SettingsSection";

// A member takes a whole row with role and actions, so fewer of them fit on a page than cards
const MEMBER_PAGE_SIZE = 10;

export default async function ProjectSettingsPage({ params, searchParams }: PageProps<"/projects/[key]/settings">) {
    const { key } = await params;
    const resolvedSearchParams = await searchParams;
    // Page and search of the member list
    const memberPagination = parsePagination(resolvedSearchParams, MEMBER_PAGE_SIZE);
    const memberSearch = parseSearch(resolvedSearchParams);
    const { offset: memberOffset, limit: memberLimit } = toOffsetAndLimit(memberPagination);
    const { project } = await graphQLFetch<GQLProjectSettingsQuery, GQLProjectSettingsQueryVariables>(projectSettingsQuery, {
        key,
        memberSearch,
        memberOffset,
        memberLimit,
    });
    if (!project?.canManage) {
        notFound();
    }
    const memberListHref = (pagination: Pagination) =>
        paginationHref(`/projects/${project.key}/settings`, pagination, memberSearch ? { search: memberSearch } : {});
    // A page behind the last one, e.g. after removing members, shows the last one instead
    const memberPageCount = pageCountOf(project.members.totalCount, memberPagination);
    if (memberPagination.page > memberPageCount) {
        redirect(memberListHref({ ...memberPagination, page: memberPageCount }));
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
    const [t, tCommon, tSidebar] = await Promise.all([getTranslations("projectSettings"), getTranslations("common"), getTranslations("sidebar")]);
    const memberIds = new Set(members.map(({ user }) => user.id));
    const usersToAdd = users.filter((user) => !memberIds.has(user.id));

    return (
        <>
            <PageHeader
                breadcrumbs={[
                    { label: tCommon("projects"), href: "/projects" },
                    { label: project.name, href: `/projects/${project.key}` },
                    { label: tSidebar("settings") },
                ]}
            />
            <PageIntro title={t("title")} description={t("description", { project: project.name })} />
            <PageContent>
                <div className="max-w-4xl">
                    <SettingsSection title={t("generalTitle")} description={t("generalDescription")}>
                        <EditProjectForm project={project} />
                    </SettingsSection>

                    <SettingsSection title={t("membersTitle")} description={t("membersDescription")}>
                        <div className="grid gap-3">
                            {/* Above the list, so adding someone does not mean scrolling past all members */}
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <ListSearch placeholder={t("searchMembersPlaceholder")} label={t("searchMembersLabel")} />
                                <AddProjectMembersDialog projectId={project.id} users={usersToAdd} />
                            </div>
                            {project.members.totalCount > 0 ? (
                                <>
                                    <ProjectMemberList project={{ ...project, members: project.members.nodes }} />
                                    <ListPagination pagination={memberPagination} totalCount={project.members.totalCount} href={memberListHref} />
                                </>
                            ) : (
                                <p className="text-muted-foreground rounded-lg border border-dashed px-3 py-6 text-center text-sm">
                                    {t("noMemberMatches")}
                                </p>
                            )}
                            {project.adminsWithoutMembership.length > 0 && (
                                <ProjectAdminAccessList projectId={project.id} admins={project.adminsWithoutMembership} />
                            )}
                        </div>
                    </SettingsSection>

                    <SettingsSection title={t("statusTitle")} description={t("statusDescription")}>
                        <ProjectStatusActions project={project} />
                    </SettingsSection>

                    <SettingsSection title={t("exportTitle")} description={t("exportDescription")}>
                        <ProjectExportButton projectKey={project.key} />
                    </SettingsSection>

                    <SettingsSection title={t("deleteTitle")} description={t("deleteDescription")}>
                        {project.status === "archived" ? (
                            <DeleteProjectDialog project={project} />
                        ) : (
                            <p className="text-muted-foreground text-sm">{t("archiveFirst")}</p>
                        )}
                    </SettingsSection>
                </div>
            </PageContent>
        </>
    );
}
