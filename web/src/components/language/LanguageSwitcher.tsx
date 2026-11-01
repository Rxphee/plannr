"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@src/components/ui/DropdownMenu";
import { SidebarMenuButton } from "@src/components/ui/Sidebar";
import { type Locale, LOCALE_COOKIE_NAME, type LocalePreference, LOCALES, parseLocalePreference } from "@src/i18n/locales";
import { LanguagesIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

// Each language in its own name, so it can be found without understanding the current one
const languageNames: Record<Locale, string> = { en: "English", de: "Deutsch" };

// The server renders the messages, so a change reloads the page data in the new language
export function LanguageSwitcher({ initialPreference }: { initialPreference: LocalePreference }) {
    const t = useTranslations("languageSwitcher");
    const router = useRouter();
    const [preference, setPreference] = useState(initialPreference);
    const [pending, startTransition] = useTransition();
    const currentLabel = preference === "system" ? t("system") : languageNames[preference];

    const changeLanguage = (value: string) => {
        const nextPreference = parseLocalePreference(value);
        setPreference(nextPreference);
        document.cookie =
            nextPreference === "system"
                ? `${LOCALE_COOKIE_NAME}=; path=/; max-age=0`
                : `${LOCALE_COOKIE_NAME}=${nextPreference}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}`;
        startTransition(() => router.refresh());
    };

    return (
        <DropdownMenu>
            <SidebarMenuButton tooltip={`${t("label")}: ${currentLabel}`} disabled={pending} render={<DropdownMenuTrigger />}>
                <LanguagesIcon />
                <span className="flex-1">{t("label")}</span>
                <span className="text-sidebar-foreground/60">{currentLabel}</span>
            </SidebarMenuButton>
            <DropdownMenuContent side="top" className="min-w-48">
                <DropdownMenuRadioGroup value={preference} onValueChange={changeLanguage}>
                    <DropdownMenuRadioItem value="system" closeOnClick>
                        {t("system")}
                    </DropdownMenuRadioItem>
                    <DropdownMenuSeparator />
                    {LOCALES.map((value) => (
                        <DropdownMenuRadioItem key={value} value={value} lang={value} closeOnClick>
                            {languageNames[value]}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
