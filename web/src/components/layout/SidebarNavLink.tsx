"use client";

import { SidebarMenuButton } from "@src/components/ui/Sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { PropsWithChildren } from "react";

interface SidebarNavLinkProps {
    href: string;
    // Shown when the sidebar is collapsed to icons
    tooltip: string;
    // Only active on the page itself, not on the pages below it
    exact?: boolean;
}

export function SidebarNavLink({ href, tooltip, exact, children }: PropsWithChildren<SidebarNavLinkProps>) {
    const pathname = usePathname();
    const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

    return (
        <SidebarMenuButton isActive={isActive} tooltip={tooltip} render={<Link href={href} />}>
            {children}
        </SidebarMenuButton>
    );
}
