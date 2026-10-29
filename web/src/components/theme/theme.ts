export const THEME_COOKIE_NAME = "theme";

export type Theme = "light" | "dark" | "system";

// Without a cookie the app follows the system setting
export function parseTheme(value?: string): Theme {
    return value === "light" || value === "dark" ? value : "system";
}
