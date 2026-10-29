import { SidebarNavLink } from "@src/components/layout/SidebarNavLink";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@src/components/ui/Sidebar";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { FolderKanbanIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

import { sidebarProjectsQuery } from "./AppSidebar.gql";
import type { GQLSidebarProjectsQuery } from "./AppSidebar.gql.generated";
import { CreateProjectDialog } from "./projects/CreateProjectDialog";
import { ProjectKeyIcon } from "./projects/ProjectKeyIcon";

export async function AppSidebar() {
    const { projects } = await graphQLFetch<GQLSidebarProjectsQuery>(sidebarProjectsQuery);
    const openProjects = projects.filter((project) => project.status !== "archived");

    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" render={<Link href="/projects" />}>
                            <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg font-semibold">
                                P
                            </span>
                            <span className="font-heading text-base font-semibold">Plannr</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarNavLink href="/projects" tooltip="Projects" exact>
                                <FolderKanbanIcon />
                                <span>Projects</span>
                            </SidebarNavLink>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Open projects</SidebarGroupLabel>
                    <CreateProjectDialog
                        trigger={
                            <SidebarGroupAction title="New project">
                                <PlusIcon />
                                <span className="sr-only">New project</span>
                            </SidebarGroupAction>
                        }
                    />
                    <SidebarMenu>
                        {openProjects.map((project) => (
                            <SidebarMenuItem key={project.id}>
                                <SidebarNavLink href={`/projects/${project.key}`} tooltip={project.name}>
                                    <ProjectKeyIcon projectKey={project.key} />
                                    <span>{project.name}</span>
                                </SidebarNavLink>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
            <SidebarRail />
        </Sidebar>
    );
}
