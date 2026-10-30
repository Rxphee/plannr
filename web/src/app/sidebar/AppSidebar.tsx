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
import { fetchAllPages } from "@src/util/fetchAllPages";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { LayoutGridIcon, TagIcon } from "lucide-react";

import { SidebarSearchButton } from "../commandMenu/SidebarSearchButton";
import { sidebarCurrentUserQuery, sidebarProjectsQuery } from "./AppSidebar.gql";
import type { GQLSidebarCurrentUserQuery, GQLSidebarProjectsQuery, GQLSidebarProjectsQueryVariables } from "./AppSidebar.gql.generated";
import { ProjectNavigation } from "./ProjectNavigation";
import { ProjectSwitcher } from "./ProjectSwitcher";
import { UserMenu } from "./UserMenu";

export type SidebarProject = GQLSidebarProjectsQuery["projects"]["nodes"][number];

export async function AppSidebar({ theme }: { theme: Theme }) {
    const [projects, { currentUser }] = await Promise.all([
        // All of them, so that the sidebar finds the open project by its key
        fetchAllPages(async (pagination) => {
            const data = await graphQLFetch<GQLSidebarProjectsQuery, GQLSidebarProjectsQueryVariables>(sidebarProjectsQuery, pagination);
            return data.projects;
        }),
        graphQLFetch<GQLSidebarCurrentUserQuery>(sidebarCurrentUserQuery),
    ]);

    return (
        <Sidebar variant="inset" collapsible="icon">
            <SidebarHeader>
                <ProjectSwitcher projects={projects} />
            </SidebarHeader>
            <SidebarContent>
                <ProjectNavigation projects={projects} />
                <SidebarGroup>
                    <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarSearchButton />
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarNavLink href="/projects" tooltip="All projects" exact className="h-9">
                                <LayoutGridIcon />
                                <span>All projects</span>
                            </SidebarNavLink>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <SidebarNavLink href="/labels" tooltip="Labels" className="h-9">
                                <TagIcon />
                                <span>Labels</span>
                            </SidebarNavLink>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <ThemeSwitcher initialTheme={theme} />
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
