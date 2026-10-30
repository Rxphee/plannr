import type { SelectOption } from "@src/components/OptionSelect";

export type ApiTokenExpiry = "30" | "90" | "365" | "never";

export const DEFAULT_API_TOKEN_EXPIRY: ApiTokenExpiry = "90";

export const apiTokenExpiryOptions: SelectOption<ApiTokenExpiry>[] = [
    { value: "30", label: "30 days" },
    { value: "90", label: "90 days" },
    { value: "365", label: "1 year" },
    { value: "never", label: "No expiry" },
];

const DAY_MS = 24 * 60 * 60 * 1000;

export function expiresAtOf(expiry: ApiTokenExpiry, now: Date = new Date()): string | null {
    return expiry === "never" ? null : new Date(now.getTime() + Number(expiry) * DAY_MS).toISOString();
}

export function isExpired(expiresAt: string | null, now: Date = new Date()): boolean {
    return expiresAt !== null && new Date(expiresAt) <= now;
}
