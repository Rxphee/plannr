import { LanguageSwitcher } from "@src/components/language/LanguageSwitcher";
import { SidebarNavLink } from "@src/components/layout/SidebarNavLink";
import type { Theme } from "@src/components/theme/theme";
import { ThemeSwitcher } from "@src/components/theme/ThemeSwitcher";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarRail,
} from "@src/components/ui/Sidebar";
import type { LocalePreference } from "@src/i18n/locales";
import { fetchAllPages } from "@src/util/fetchAllPages";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { LayoutGridIcon, TagIcon, UsersIcon } from "lucide-react";
import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";

import { isAppleUserAgent } from "../commandMenu/keyboardShortcuts";
import { SidebarSearchButton } from "../commandMenu/SidebarSearchButton";
import { sidebarCurrentUserQuery, sidebarProjectsQuery } from "./AppSidebar.gql";
import type { GQLSidebarCurrentUserQuery, GQLSidebarProjectsQuery, GQLSidebarProjectsQueryVariables } from "./AppSidebar.gql.generated";
import { ProjectNavigation } from "./ProjectNavigation";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { UserMenu } from "./UserMenu";

export type SidebarProject = GQLSidebarProjectsQuery["projects"]["nodes"][number];

interface AppSidebarProps {
    theme: Theme;
    localePreference: LocalePreference;
}

export async function AppSidebar({ theme, localePreference }: AppSidebarProps) {
    const [projects, { currentUser, canAppointAdmins }, requestHeaders, t] = await Promise.all([
        // All of them, so that the sidebar finds the open project by its key
        fetchAllPages(async (pagination) => {
            const data = await graphQLFetch<GQLSidebarProjectsQuery, GQLSidebarProjectsQueryVariables>(sidebarProjectsQuery, pagination);
            return data.projects;
        }),
        graphQLFetch<GQLSidebarCurrentUserQuery>(sidebarCurrentUserQuery),
        headers(),
        getTranslations("sidebar"),
    ]);

    return (
        <Sidebar variant="inset" collapsible="icon">
            <SidebarHeader>
                <ProjectSwitcher projects={projects} />
            </SidebarHeader>
            <SidebarContent>
                <ProjectNavigation projects={projects} />
                <SidebarGroup>
                    <SidebarGroupLabel>{t("workspace")}</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarSearchButton isApple={isAppleUserAgent(requestHeaders.get("user-agent"))} />
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarNavLink href="/projects" tooltip={t("allProjects")} exact className="h-9">
                                <LayoutGridIcon />
                                <span>{t("allProjects")}</span>
                            </SidebarNavLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarNavLink href="/labels" tooltip={t("labels")} className="h-9">
                                <TagIcon />
                                <span>{t("labels")}</span>
                            </SidebarNavLink>
                        </SidebarMenuItem>
                        {canAppointAdmins && (
                            <SidebarMenuItem>
                                <SidebarNavLink href="/users" tooltip={t("users")} className="h-9">
                                    <UsersIcon />
                                    <span>{t("users")}</span>
                                </SidebarNavLink>
                            </SidebarMenuItem>
                        )}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <ThemeSwitcher initialTheme={theme} />
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <LanguageSwitcher initialPreference={localePreference} />
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <UserMenu user={currentUser} />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
