import { requireEnv, requireSecret } from "@src/util/requireEnv";

import { seal, unseal } from "./sealedCookie";

const SESSION_COOKIE = "plannr_session";
// Browsers drop cookies over 4 KB, which the tokens of some identity providers exceed together, so the session is split into chunks
const CHUNK_SIZE = 3800;
// The identity provider decides how long a session lasts by the lifetime of its refresh token. The cookie only must not end earlier.
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
// Refreshed a little before it expires, so that it stays valid while the page renders
const REFRESH_MARGIN = 60;

export interface Session {
    accessToken: string;
    // Seconds since the epoch, like the exp claim of a JWT
    expiresAt: number;
    refreshToken?: string;
    // Tells the identity provider on logout which session ends
    idToken?: string;
}

export async function sealSession(session: Session): Promise<string> {
    return seal({ ...session }, { secret: requireSecret("SESSION_SECRET"), maxAge: SESSION_MAX_AGE });
}

export async function unsealSession(value: string | undefined): Promise<Session | undefined> {
    const payload = await unseal(value, { secret: requireSecret("SESSION_SECRET") });
    if (typeof payload?.accessToken !== "string" || typeof payload.expiresAt !== "number") {
        return undefined;
    }
    return {
        accessToken: payload.accessToken,
        expiresAt: payload.expiresAt,
        refreshToken: typeof payload.refreshToken === "string" ? payload.refreshToken : undefined,
        idToken: typeof payload.idToken === "string" ? payload.idToken : undefined,
    };
}

export function needsRefresh(session: Session, now = Date.now()): boolean {
    return session.expiresAt - REFRESH_MARGIN <= now / 1000;
}

export function sessionCookieOptions() {
    return {
        httpOnly: true,
        secure: requireEnv("WEB_URL").startsWith("https:"),
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE,
    } as const;
}

interface CookieList {
    getAll(): { name: string; value: string }[];
}

interface CookieWriter {
    set(name: string, value: string, options: ReturnType<typeof sessionCookieOptions>): unknown;
}

function chunkIndex(cookieName: string): number | undefined {
    const match = cookieName.match(/^plannr_session\.(\d+)$/);
    return match ? Number(match[1]) : undefined;
}

function sessionChunks(cookies: CookieList): { name: string; value: string; index: number }[] {
    return cookies
        .getAll()
        .flatMap(({ name, value }) => {
            const index = chunkIndex(name);
            return index === undefined ? [] : [{ name, value, index }];
        })
        .sort((first, second) => first.index - second.index);
}

export function readSessionCookies(cookies: CookieList): string | undefined {
    const chunks = sessionChunks(cookies);
    return chunks.length > 0 ? chunks.map(({ value }) => value).join("") : undefined;
}

export function splitSessionCookies(sealedSession: string): { name: string; value: string }[] {
    const chunks = [];
    for (let start = 0; start < sealedSession.length; start += CHUNK_SIZE) {
        chunks.push({ name: `${SESSION_COOKIE}.${chunks.length}`, value: sealedSession.slice(start, start + CHUNK_SIZE) });
    }
    return chunks;
}

// The cookies of the previous session that the new one does not overwrite
export function staleSessionCookieNames(previousCookies: CookieList, sealedSession?: string): string[] {
    const chunkCount = sealedSession ? splitSessionCookies(sealedSession).length : 0;
    return sessionChunks(previousCookies)
        .filter(({ index }) => index >= chunkCount)
        .map(({ name }) => name);
}

// Without a sealed session, it removes the session
export function writeSessionCookies(cookies: CookieWriter, previousCookies: CookieList, sealedSession?: string): void {
    for (const { name, value } of sealedSession ? splitSessionCookies(sealedSession) : []) {
        cookies.set(name, value, sessionCookieOptions());
    }
    for (const name of staleSessionCookieNames(previousCookies, sealedSession)) {
        cookies.set(name, "", { ...sessionCookieOptions(), maxAge: 0 });
    }
}
