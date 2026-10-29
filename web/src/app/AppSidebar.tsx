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
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@src/components/ui/Sidebar";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { LayoutGridIcon, PauseIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

import { sidebarProjectsQuery } from "./AppSidebar.gql";
import type { GQLSidebarProjectsQuery } from "./AppSidebar.gql.generated";
import { CreateProjectDialog } from "./projects/CreateProjectDialog";
import { ProjectIcon } from "./projects/ProjectIcon";

export async function AppSidebar({ theme }: { theme: Theme }) {
    const { projects } = await graphQLFetch<GQLSidebarProjectsQuery>(sidebarProjectsQuery);
    const openProjects = projects.filter((project) => project.status !== "archived");

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
                    <SidebarGroupLabel>Open projects</SidebarGroupLabel>
                    <CreateProjectDialog
                        trigger={
                            <SidebarGroupAction title="New project" className="top-2.5 right-2 size-7 [&>svg]:size-4.5">
                                <PlusIcon />
                                <span className="sr-only">New project</span>
                            </SidebarGroupAction>
                        }
                    />
                    <SidebarMenu>
                        {openProjects.map((project) => (
                            <SidebarMenuItem key={project.id}>
                                <SidebarNavLink
                                    href={`/projects/${project.key}`}
                                    tooltip={project.name}
                                    className="h-9 group-data-[collapsible=icon]:p-1.5!"
                                >
                                    <ProjectIcon projectKey={project.key} />
                                    <span className={project.status === "paused" ? "text-sidebar-foreground/60" : undefined}>{project.name}</span>
                                </SidebarNavLink>
                                {project.status === "paused" && (
                                    <SidebarMenuBadge title="Paused" className="top-2!">
                                        <PauseIcon className="text-sidebar-foreground/50 size-4" />
                                    </SidebarMenuBadge>
                                )}
                            </SidebarMenuItem>
                        ))}
                        {openProjects.length === 0 && <p className="text-sidebar-foreground/60 px-2 py-1 text-sm">No open projects yet.</p>}
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
