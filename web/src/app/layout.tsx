import "./globals.css";

import { SidebarInset, SidebarProvider } from "@src/components/ui/Sidebar";
import { cn } from "@src/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import type { PropsWithChildren } from "react";

import { AppSidebar } from "./AppSidebar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
    title: "Plannr",
    description: "A lean, self-hosted issue tracker",
};

export default async function RootLayout({ children }: PropsWithChildren) {
    // The sidebar remembers in this cookie whether it is collapsed
    const isSidebarOpen = (await cookies()).get("sidebar_state")?.value !== "false";

    return (
        <html lang="en" className={cn("font-sans", inter.variable)}>
            <body>
                <SidebarProvider defaultOpen={isSidebarOpen}>
                    <AppSidebar />
                    <SidebarInset>{children}</SidebarInset>
                </SidebarProvider>
            </body>
        </html>
    );
}
