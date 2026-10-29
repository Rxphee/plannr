import { SidebarNavLink } from "@src/components/layout/SidebarNavLink";
import type { Theme } from "@src/components/theme/theme";
import { ThemeSwitcher } from "@src/components/theme/ThemeSwitcher";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@src/components/ui/Sidebar";
import { cn } from "@src/lib/utils";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { LayoutGridIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

import { sidebarProjectsQuery } from "./AppSidebar.gql";
import type { GQLSidebarProjectsQuery } from "./AppSidebar.gql.generated";
import { CreateProjectDialog } from "./projects/CreateProjectDialog";
import { ProjectIcon } from "./projects/ProjectIcon";

export async function AppSidebar({ theme }: { theme: Theme }) {
    const { projects } = await graphQLFetch<GQLSidebarProjectsQuery>(sidebarProjectsQuery);
    const activeProjects = projects.filter((project) => project.status === "active");
    const pausedProjects = projects.filter((project) => project.status === "paused");

    return (
        <Sidebar variant="inset" collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" render={<Link href="/projects" />}>
                            <span className="from-primary flex size-8 shrink-0 items-center justify-center rounded-lg bg-linear-to-br to-blue-800 font-semibold text-white shadow-xs">
                                P
                            </span>
                            <span className="grid leading-tight">
                                <span className="font-heading text-base font-semibold">Plannr</span>
                                <span className="text-sidebar-foreground/60 text-xs">Issue tracker</span>
                            </span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarNavLink href="/projects" tooltip="Projects" exact className="h-9">
                                <LayoutGridIcon />
                                <span>Projects</span>
                            </SidebarNavLink>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Active projects</SidebarGroupLabel>
                    <CreateProjectDialog
                        trigger={
                            <SidebarGroupAction title="New project" className="top-2.5 right-2 size-7 [&>svg]:size-4.5">
                                <PlusIcon />
                                <span className="sr-only">New project</span>
                            </SidebarGroupAction>
                        }
                    />
                    <SidebarProjectList projects={activeProjects} />
                    {activeProjects.length === 0 && <p className="text-sidebar-foreground/60 px-2 py-1 text-sm">No active projects.</p>}
                </SidebarGroup>
                {pausedProjects.length > 0 && (
                    <SidebarGroup>
                        <SidebarGroupLabel>Paused</SidebarGroupLabel>
                        <SidebarProjectList projects={pausedProjects} isMuted />
                    </SidebarGroup>
                )}
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

function SidebarProjectList({ projects, isMuted }: { projects: GQLSidebarProjectsQuery["projects"]; isMuted?: boolean }) {
    return (
        <SidebarMenu>
            {projects.map((project) => (
                <SidebarMenuItem key={project.id}>
                    <SidebarNavLink
                        href={`/projects/${project.key}`}
                        tooltip={project.name}
                        className={cn(
                            "h-9 group-data-[collapsible=icon]:p-1.5!",
                            isMuted && "text-sidebar-foreground/60 [&>[aria-hidden]]:opacity-60",
                        )}
                    >
                        <ProjectIcon projectKey={project.key} />
                        <span>{project.name}</span>
                    </SidebarNavLink>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    );
}
