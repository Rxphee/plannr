"use client";

import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandShortcut,
} from "@src/components/ui/Command";
import { Kbd } from "@src/components/ui/Kbd";
import { useDebouncedSearch } from "@src/hooks/useDebouncedSearch";
import { LayoutGridIcon, PlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { IssueStatusDot } from "../projects/[key]/issues/IssueStatusBadge";
import { IssueTypeIcon } from "../projects/[key]/issues/IssueTypeIcon";
import { ProjectIcon } from "../projects/ProjectIcon";
import { type CommandMenuResults, searchCommandMenu } from "./searchCommandMenu";

interface CommandMenuProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // Without it the user may not add issues to any project
    onQuickCapture?: () => void;
}

const noResults: CommandMenuResults = { projects: [], issues: [] };

// Finds issues by key or title and projects by name or key, across all projects the user can see
export function CommandMenu({ open, onOpenChange, onQuickCapture }: CommandMenuProps) {
    const router = useRouter();
    const [results, setResults] = useState(noResults);
    const [isSearching, setIsSearching] = useState(false);
    // Only the answer to the latest search counts, an earlier one may arrive later
    const latestSearch = useRef<string | undefined>(undefined);

    const applySearch = async (search?: string) => {
        latestSearch.current = search;
        if (!search) {
            setResults(noResults);
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        // A failed search shows no results instead of a spinner that never ends
        const searchResults = await searchCommandMenu(search).catch((error: unknown) => {
            console.error(error);
            return noResults;
        });
        if (latestSearch.current === search) {
            setResults(searchResults);
            setIsSearching(false);
        }
    };
    const { search, changeSearch, clearSearch } = useDebouncedSearch("", (nextSearch) => void applySearch(nextSearch));

    const changeOpen = (isOpen: boolean) => {
        if (!isOpen) {
            clearSearch();
            void applySearch(undefined);
        }
        onOpenChange(isOpen);
    };

    const runCommand = (command: () => void) => {
        changeOpen(false);
        command();
    };

    const hasSearch = search.trim() !== "";
    const hasResults = results.issues.length > 0 || results.projects.length > 0;

    return (
        <CommandDialog open={open} onOpenChange={changeOpen} title="Search" description="Find issues by key or title and projects by name or key">
            <Command shouldFilter={false}>
                <CommandInput value={search} onValueChange={changeSearch} placeholder="Search issues and projects…" />
                <CommandList>
                    {hasSearch && !hasResults && <CommandEmpty>{isSearching ? "Searching…" : "No issues or projects found."}</CommandEmpty>}
                    {results.issues.length > 0 && (
                        <CommandGroup heading="Issues">
                            {results.issues.map((issue) => (
                                <CommandItem
                                    key={issue.id}
                                    value={`issue-${issue.id}`}
                                    onSelect={() => runCommand(() => router.push(`/projects/${issue.project.key}/issues/${issue.number}`))}
                                >
                                    <IssueTypeIcon type={issue.type} />
                                    <span className="text-muted-foreground w-16 shrink-0 font-mono text-xs">{issue.key}</span>
                                    <span className="min-w-0 flex-1 truncate">{issue.title}</span>
                                    <IssueStatusDot status={issue.status} />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                    {results.projects.length > 0 && (
                        <CommandGroup heading="Projects">
                            {results.projects.map((project) => (
                                <CommandItem
                                    key={project.id}
                                    value={`project-${project.id}`}
                                    onSelect={() => runCommand(() => router.push(`/projects/${project.key}`))}
                                >
                                    <ProjectIcon projectKey={project.key} />
                                    <span className="min-w-0 flex-1 truncate">{project.name}</span>
                                    <span className="text-muted-foreground font-mono text-xs">{project.key}</span>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                    {!hasSearch && (
                        <CommandGroup heading="Actions">
                            {onQuickCapture && (
                                <CommandItem value="create-issue" onSelect={() => runCommand(onQuickCapture)}>
                                    <PlusIcon />
                                    Create issue
                                    <CommandShortcut>
                                        <Kbd>C</Kbd>
                                    </CommandShortcut>
                                </CommandItem>
                            )}
                            <CommandItem value="all-projects" onSelect={() => runCommand(() => router.push("/projects"))}>
                                <LayoutGridIcon />
                                All projects
                            </CommandItem>
                        </CommandGroup>
                    )}
                </CommandList>
            </Command>
        </CommandDialog>
    );
}
