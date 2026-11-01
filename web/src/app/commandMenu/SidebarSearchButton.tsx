"use client";

import { Kbd } from "@src/components/ui/Kbd";
import { SidebarMenuButton } from "@src/components/ui/Sidebar";
import { SearchIcon } from "lucide-react";

import { useCommandMenu } from "./CommandMenuProvider";

// Opens the command menu and shows its shortcut. The server decides isApple from the user agent, so the first paint already shows the right one.
export function SidebarSearchButton({ isApple }: { isApple?: boolean }) {
    const { openCommandMenu } = useCommandMenu();

    return (
        <SidebarMenuButton tooltip="Search" className="h-9" onClick={openCommandMenu}>
            <SearchIcon />
            <span>Search</span>
            <Kbd className="ml-auto group-data-[collapsible=icon]:hidden">{isApple ? "⌘K" : "Ctrl K"}</Kbd>
        </SidebarMenuButton>
    );
}
