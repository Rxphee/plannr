export type ApiTokenExpiry = "30" | "90" | "365" | "never";

export const API_TOKEN_EXPIRIES: ApiTokenExpiry[] = ["30", "90", "365", "never"];

export const DEFAULT_API_TOKEN_EXPIRY: ApiTokenExpiry = "90";

const DAY_MS = 24 * 60 * 60 * 1000;

export function expiresAtOf(expiry: ApiTokenExpiry, now: Date = new Date()): string | null {
    return expiry === "never" ? null : new Date(now.getTime() + Number(expiry) * DAY_MS).toISOString();
}

export function isExpired(expiresAt: string | null, now: Date = new Date()): boolean {
    return expiresAt !== null && new Date(expiresAt) <= now;
}
