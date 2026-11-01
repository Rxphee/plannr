"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@src/components/ui/DropdownMenu";
import { SidebarMenuButton } from "@src/components/ui/Sidebar";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { parseTheme, type Theme, THEME_COOKIE_NAME } from "./theme";

const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const themeOptions = [
    { value: "system", icon: MonitorIcon },
    { value: "light", icon: SunIcon },
    { value: "dark", icon: MoonIcon },
] satisfies { value: Theme; icon: typeof MonitorIcon }[];

// The root layout reads the cookie on the server and sets data-theme, so a page never flashes in the wrong theme
export function ThemeSwitcher({ initialTheme }: { initialTheme: Theme }) {
    const t = useTranslations("themeSwitcher");
    const [theme, setTheme] = useState(initialTheme);
    const current = themeOptions.find((option) => option.value === theme) ?? themeOptions[0];

    const changeTheme = (value: string) => {
        const nextTheme = parseTheme(value);
        setTheme(nextTheme);
        if (nextTheme === "system") {
            delete document.documentElement.dataset.theme;
            document.cookie = `${THEME_COOKIE_NAME}=; path=/; max-age=0`;
        } else {
            document.documentElement.dataset.theme = nextTheme;
            document.cookie = `${THEME_COOKIE_NAME}=${nextTheme}; path=/; max-age=${THEME_COOKIE_MAX_AGE}`;
        }
    };

    return (
        <DropdownMenu>
            <SidebarMenuButton tooltip={`${t("label")}: ${t(current.value)}`} render={<DropdownMenuTrigger />}>
                <current.icon />
                <span className="flex-1">{t("label")}</span>
                <span className="text-sidebar-foreground/60">{t(current.value)}</span>
            </SidebarMenuButton>
            <DropdownMenuContent side="top" className="min-w-40">
                <DropdownMenuRadioGroup value={theme} onValueChange={changeTheme}>
                    {themeOptions.map((option) => (
                        <DropdownMenuRadioItem key={option.value} value={option.value} closeOnClick>
                            <option.icon />
                            {t(option.value)}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
