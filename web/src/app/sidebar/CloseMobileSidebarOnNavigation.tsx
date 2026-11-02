"use client";

import { useSidebar } from "@src/components/ui/Sidebar";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// On phones the sidebar covers the page, so it closes as soon as a link in it (or the command menu) opens another page
export function CloseMobileSidebarOnNavigation() {
    const pathname = usePathname();
    const { setOpenMobile } = useSidebar();

    useEffect(() => {
        setOpenMobile(false);
    }, [pathname, setOpenMobile]);

    return null;
}
