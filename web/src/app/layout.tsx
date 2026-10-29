import "./globals.css";

import { parseTheme, THEME_COOKIE_NAME } from "@src/components/theme/theme";
import { SidebarInset, SidebarProvider } from "@src/components/ui/Sidebar";
import { cn } from "@src/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import type { PropsWithChildren } from "react";

import { AppSidebar } from "./sidebar/AppSidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
    title: "Plannr",
    description: "A lean, self-hosted issue tracker",
};

export default async function RootLayout({ children }: PropsWithChildren) {
    const cookieStore = await cookies();
    // The sidebar remembers in this cookie whether it is collapsed
    const isSidebarOpen = cookieStore.get("sidebar_state")?.value !== "false";
    const theme = parseTheme(cookieStore.get(THEME_COOKIE_NAME)?.value);

    return (
        <html lang="en" className={cn("font-sans", inter.variable)} data-theme={theme === "system" ? undefined : theme}>
            <body>
                <SidebarProvider defaultOpen={isSidebarOpen}>
                    <AppSidebar theme={theme} />
                    <SidebarInset className="md:ring-border md:ring-1">{children}</SidebarInset>
                </SidebarProvider>
            </body>
        </html>
    );
}
