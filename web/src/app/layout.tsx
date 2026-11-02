import "./globals.css";

import { parseTheme, THEME_COOKIE_NAME } from "@src/components/theme/theme";
import { SidebarInset, SidebarProvider } from "@src/components/ui/Sidebar";
import { Toaster } from "@src/components/ui/Sonner";
import { LOCALE_COOKIE_NAME, parseLocalePreference } from "@src/i18n/locales";
import { cn } from "@src/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cookies } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import type { PropsWithChildren } from "react";

import { AppCommands } from "./commandMenu/AppCommands";
import { AppSidebar } from "./sidebar/AppSidebar";
import { CloseMobileSidebarOnNavigation } from "./sidebar/CloseMobileSidebarOnNavigation";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export async function generateMetadata(): Promise<Metadata> {
    const t = await getTranslations("metadata");
    return { title: "Plannr", description: t("description") };
}

export default async function RootLayout({ children }: PropsWithChildren) {
    const cookieStore = await cookies();
    // The sidebar remembers in this cookie whether it is collapsed
    const isSidebarOpen = cookieStore.get("sidebar_state")?.value !== "false";
    const theme = parseTheme(cookieStore.get(THEME_COOKIE_NAME)?.value);
    const localePreference = parseLocalePreference(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
    const locale = await getLocale();

    return (
        <html lang={locale} className={cn("font-sans", inter.variable)} data-theme={theme === "system" ? undefined : theme}>
            <body>
                <NextIntlClientProvider>
                    <SidebarProvider defaultOpen={isSidebarOpen}>
                        <AppCommands>
                            <AppSidebar theme={theme} localePreference={localePreference} />
                            <CloseMobileSidebarOnNavigation />
                            <SidebarInset className="md:ring-border md:ring-1">{children}</SidebarInset>
                        </AppCommands>
                    </SidebarProvider>
                    <Toaster />
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
