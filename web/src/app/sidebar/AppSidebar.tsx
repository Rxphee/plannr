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
import { KeyRoundIcon, LayoutGridIcon } from "lucide-react";

import { sidebarProjectsQuery } from "./AppSidebar.gql";
import type { GQLSidebarProjectsQuery, GQLSidebarProjectsQueryVariables } from "./AppSidebar.gql.generated";
import { ProjectNavigation } from "./ProjectNavigation";
import { ProjectSwitcher } from "./ProjectSwitcher";

export type SidebarProject = GQLSidebarProjectsQuery["projects"]["nodes"][number];

export async function AppSidebar({ theme }: { theme: Theme }) {
    // All of them, so that the sidebar finds the open project by its key
    const projects = await fetchAllPages(async (pagination) => {
        const data = await graphQLFetch<GQLSidebarProjectsQuery, GQLSidebarProjectsQueryVariables>(sidebarProjectsQuery, pagination);
        return data.projects;
    });

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
                            <SidebarNavLink href="/projects" tooltip="All projects" exact className="h-9">
                                <LayoutGridIcon />
                                <span>All projects</span>
                            </SidebarNavLink>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarNavLink href="/settings/api-tokens" tooltip="API tokens" className="h-9">
                            <KeyRoundIcon />
                            <span>API tokens</span>
                        </SidebarNavLink>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <ThemeSwitcher initialTheme={theme} />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
