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
import { graphQLFetch } from "@src/util/graphQLFetch";
import { LayoutGridIcon } from "lucide-react";

import { sidebarProjectsQuery } from "./AppSidebar.gql";
import type { GQLSidebarProjectsQuery } from "./AppSidebar.gql.generated";
import { ProjectNavigation } from "./ProjectNavigation";
import { ProjectSwitcher } from "./ProjectSwitcher";

export type SidebarProject = GQLSidebarProjectsQuery["projects"][number];

export async function AppSidebar({ theme }: { theme: Theme }) {
    const { projects } = await graphQLFetch<GQLSidebarProjectsQuery>(sidebarProjectsQuery);

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
                        <ThemeSwitcher initialTheme={theme} />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
}
