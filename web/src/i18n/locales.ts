export const LOCALES = ["en", "de"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE_NAME = "locale";

export type LocalePreference = Locale | "system";

export function isLocale(value: unknown): value is Locale {
    return LOCALES.includes(value as Locale);
}

// Without a cookie the app follows the languages of the browser
export function parseLocalePreference(value?: string): LocalePreference {
    return isLocale(value) ? value : "system";
}

// Picks the supported language the browser prefers most, from an Accept-Language header like "de-AT,de;q=0.9,en;q=0.8"
export function negotiateLocale(acceptLanguage: string | null): Locale {
    const requested = (acceptLanguage ?? "")
        .split(",")
        .map((entry) => {
            const [range, ...parameters] = entry.trim().split(";");
            const quality = parameters.map((parameter) => /^\s*q=([\d.]+)\s*$/.exec(parameter)?.[1]).find((value) => value !== undefined);
            return { language: range.split("-")[0].toLowerCase(), quality: quality === undefined ? 1 : Number(quality) };
        })
        .filter(({ quality }) => quality > 0)
        .sort((first, second) => second.quality - first.quality);

    return requested.map(({ language }) => language).find(isLocale) ?? DEFAULT_LOCALE;
}
