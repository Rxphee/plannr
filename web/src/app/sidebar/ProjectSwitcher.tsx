"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { ClearButton } from "@src/components/ClearButton";
import {
    Combobox,
    ComboboxCollection,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxGroup,
    ComboboxInput,
    ComboboxItem,
    ComboboxLabel,
    ComboboxList,
    ComboboxSeparator,
} from "@src/components/ui/Combobox";
import { InputGroupAddon } from "@src/components/ui/InputGroup";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@src/components/ui/Sidebar";
import { ChevronsUpDownIcon, LayoutGridIcon, SearchIcon } from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";

import { ProjectIcon } from "../projects/ProjectIcon";
import type { SidebarProject } from "./AppSidebar";
import { useCurrentProject } from "./useCurrentProject";

interface ProjectGroup {
    label: string;
    items: SidebarProject[];
}

// Shows where the user is and switches to another project, found by name or key
export function ProjectSwitcher({ projects }: { projects: SidebarProject[] }) {
    const currentProject = useCurrentProject(projects);
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const searchInputRef = useRef<HTMLInputElement>(null);
    const { contains } = ComboboxPrimitive.useFilter();
    const groups: ProjectGroup[] = [
        { label: "Active", items: projects.filter((project) => project.status === "active") },
        { label: "Paused", items: projects.filter((project) => project.status === "paused") },
    ].filter((group) => group.items.length > 0);

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <Combobox
                    items={groups}
                    value={currentProject ?? null}
                    open={isOpen}
                    onOpenChange={setIsOpen}
                    inputValue={query}
                    onInputValueChange={setQuery}
                    autoHighlight
                    itemToStringLabel={(project) => project.name}
                    isItemEqualToValue={(project, value) => project.id === value.id}
                    filter={(project, query) => contains(project, query, ({ name }) => name) || contains(project, query, ({ key }) => key)}
                >
                    <SidebarMenuButton size="lg" tooltip={currentProject?.name ?? "Choose a project"} render={<ComboboxPrimitive.Trigger />}>
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
                    <ComboboxContent className="min-w-60">
                        <ComboboxInput ref={searchInputRef} placeholder="Search projects" showTrigger={false}>
                            <InputGroupAddon>
                                <SearchIcon />
                            </InputGroupAddon>
                            {/* Combobox.Clear would clear the chosen project, not the search */}
                            {query && (
                                <InputGroupAddon align="inline-end">
                                    <ClearButton
                                        onClick={() => {
                                            setQuery("");
                                            searchInputRef.current?.focus();
                                        }}
                                    />
                                </InputGroupAddon>
                            )}
                        </ComboboxInput>
                        <ComboboxEmpty>No projects found</ComboboxEmpty>
                        <ComboboxList>
                            {(group: ProjectGroup) => (
                                <ComboboxGroup key={group.label} items={group.items}>
                                    <ComboboxLabel>{group.label}</ComboboxLabel>
                                    <ComboboxCollection>
                                        {(project: SidebarProject) => (
                                            <ComboboxItem
                                                key={project.id}
                                                value={project}
                                                render={<Link href={`/projects/${project.key}`} />}
                                                // The value follows the path, so choosing a project alone does not close the popup
                                                onClick={() => setIsOpen(false)}
                                            >
                                                <ProjectIcon projectKey={project.key} />
                                                <span className="flex-1 truncate">{project.name}</span>
                                            </ComboboxItem>
                                        )}
                                    </ComboboxCollection>
                                </ComboboxGroup>
                            )}
                        </ComboboxList>
                        <ComboboxSeparator className="mx-0 mt-0" />
                        <div className="p-1 pt-0">
                            <Link
                                href="/projects"
                                onClick={() => setIsOpen(false)}
                                className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden [&_svg]:size-4"
                            >
                                <LayoutGridIcon />
                                All projects
                            </Link>
                        </div>
                    </ComboboxContent>
                </Combobox>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
