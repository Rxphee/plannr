"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@src/components/ui/DropdownMenu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@src/components/ui/Sidebar";
import { CheckIcon, ChevronsUpDownIcon, LayoutGridIcon } from "lucide-react";
import Link from "next/link";

import { ProjectIcon } from "../projects/ProjectIcon";
import type { SidebarProject } from "./AppSidebar";
import { useCurrentProject } from "./useCurrentProject";

// Shows where the user is and switches to another project
export function ProjectSwitcher({ projects }: { projects: SidebarProject[] }) {
    const currentProject = useCurrentProject(projects);
    const groups = [
        { label: "Active", projects: projects.filter((project) => project.status === "active") },
        { label: "Paused", projects: projects.filter((project) => project.status === "paused") },
    ].filter((group) => group.projects.length > 0);

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <DropdownMenu>
                    <SidebarMenuButton size="lg" tooltip={currentProject?.name ?? "Choose a project"} render={<DropdownMenuTrigger />}>
                        {currentProject ? (
                            <ProjectIcon projectKey={currentProject.key} size="md" />
                        ) : (
                            <span className="from-primary flex size-8 shrink-0 items-center justify-center rounded-md bg-linear-to-br to-blue-800 font-semibold text-white shadow-xs">
                                P
                            </span>
                        )}
                        <span className="grid flex-1 leading-tight">
                            <span className="font-heading truncate font-semibold">{currentProject?.name ?? "Plannr"}</span>
                            <span className="text-sidebar-foreground/60 truncate text-xs">
                                {currentProject ? <span className="font-mono">{currentProject.key}</span> : "Choose a project"}
                            </span>
                        </span>
                        <ChevronsUpDownIcon className="text-sidebar-foreground/60" />
                    </SidebarMenuButton>
                    <DropdownMenuContent className="w-(--anchor-width) min-w-60">
                        {groups.map((group) => (
                            <DropdownMenuGroup key={group.label}>
                                <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
                                {group.projects.map((project) => (
                                    <DropdownMenuItem key={project.id} render={<Link href={`/projects/${project.key}`} />}>
                                        <ProjectIcon projectKey={project.key} />
                                        <span className="flex-1 truncate">{project.name}</span>
                                        {project.id === currentProject?.id && <CheckIcon />}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuGroup>
                        ))}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem render={<Link href="/projects" />}>
                            <LayoutGridIcon />
                            All projects
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
