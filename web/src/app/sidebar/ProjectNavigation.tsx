"use client";

import { SidebarNavLink } from "@src/components/layout/SidebarNavLink";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuItem } from "@src/components/ui/Sidebar";
import { LayersIcon, LayoutDashboardIcon, ListTodoIcon, SettingsIcon } from "lucide-react";
import { useTranslations } from "next-intl";

import type { SidebarProject } from "./AppSidebar";
import { useCurrentProject } from "./useCurrentProject";

// The sections of the open project
export function ProjectNavigation({ projects }: { projects: SidebarProject[] }) {
    const t = useTranslations("sidebar");
    const currentProject = useCurrentProject(projects);
    if (!currentProject) {
        return null;
    }

    const projectPath = `/projects/${currentProject.key}`;

    return (
        <SidebarGroup>
            <SidebarGroupLabel>{t("project")}</SidebarGroupLabel>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarNavLink href={projectPath} tooltip={t("overview")} exact className="h-9">
                        <LayoutDashboardIcon />
                        <span>{t("overview")}</span>
                    </SidebarNavLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarNavLink href={`${projectPath}/epics`} tooltip={t("epics")} className="h-9">
                        <LayersIcon />
                        <span>{t("epics")}</span>
                    </SidebarNavLink>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarNavLink href={`${projectPath}/issues`} tooltip={t("issues")} className="h-9">
                        <ListTodoIcon />
                        <span>{t("issues")}</span>
                    </SidebarNavLink>
                </SidebarMenuItem>
                {currentProject.canManage && (
                    <SidebarMenuItem>
                        <SidebarNavLink href={`${projectPath}/settings`} tooltip={t("settings")} className="h-9">
                            <SettingsIcon />
                            <span>{t("settings")}</span>
                        </SidebarNavLink>
                    </SidebarMenuItem>
                )}
            </SidebarMenu>
        </SidebarGroup>
    );
}
