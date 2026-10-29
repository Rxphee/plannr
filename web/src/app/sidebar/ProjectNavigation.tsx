"use client";

import { SidebarNavLink } from "@src/components/layout/SidebarNavLink";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem } from "@src/components/ui/Sidebar";
import { LayoutDashboardIcon, SettingsIcon } from "lucide-react";

import type { SidebarProject } from "./AppSidebar";
import { useCurrentProject } from "./useCurrentProject";

// The sections of the open project; epics and issues will join them
export function ProjectNavigation({ projects }: { projects: SidebarProject[] }) {
    const currentProject = useCurrentProject(projects);
    if (!currentProject) {
        return null;
    }

    const projectPath = `/projects/${currentProject.key}`;

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Project</SidebarGroupLabel>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarNavLink href={projectPath} tooltip="Overview" exact className="h-9">
                        <LayoutDashboardIcon />
                        <span>Overview</span>
                    </SidebarNavLink>
                </SidebarMenuItem>
                {currentProject.canManage && (
                    <SidebarMenuItem>
                        <SidebarNavLink href={`${projectPath}/settings`} tooltip="Settings" className="h-9">
                            <SettingsIcon />
                            <span>Settings</span>
                        </SidebarNavLink>
                    </SidebarMenuItem>
                )}
            </SidebarMenu>
        </SidebarGroup>
    );
}
