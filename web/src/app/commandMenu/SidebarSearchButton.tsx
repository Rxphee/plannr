"use client";

import { Kbd } from "@src/components/ui/Kbd";
import { SidebarMenuButton } from "@src/components/ui/Sidebar";
import { SearchIcon } from "lucide-react";
import { useSyncExternalStore } from "react";

import { useCommandMenu } from "./CommandMenuProvider";

const subscribeToNothing = () => () => {};

// Opens the command menu and shows its shortcut, ⌘K on Apple devices and Ctrl K elsewhere
export function SidebarSearchButton() {
    const { openCommandMenu } = useCommandMenu();
    const isApple = useSyncExternalStore(
        subscribeToNothing,
        () => /Mac|iPhone|iPad/.test(navigator.userAgent),
        () => true,
    );

    return (
        <SidebarMenuButton tooltip="Search" className="h-9" onClick={openCommandMenu}>
            <SearchIcon />
            <span>Search</span>
            <Kbd className="ml-auto group-data-[collapsible=icon]:hidden">{isApple ? "⌘K" : "Ctrl K"}</Kbd>
        </SidebarMenuButton>
    );
}
