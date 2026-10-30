import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { needsRefresh, readSessionCookies, sealSession, type Session, splitSessionCookies, staleSessionCookieNames, unsealSession } from "./session";

const session: Session = { accessToken: "access", expiresAt: 1_800_000_000, refreshToken: "refresh", idToken: "id" };

describe("session", () => {
    beforeEach(() => {
        vi.stubEnv("SESSION_SECRET", "a-secret-for-the-tests-of-32-characters");
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("reads a sealed session back", async () => {
        await expect(unsealSession(await sealSession(session))).resolves.toEqual(session);
    });

    it("does not show the tokens in the cookie", async () => {
        expect(await sealSession(session)).not.toContain(btoa('"accessToken"').slice(0, 8));
    });

    it("ignores a tampered cookie", async () => {
        const sealed = await sealSession(session);
        const tampered = `${sealed.slice(0, -4)}${sealed.endsWith("AAAA") ? "BBBB" : "AAAA"}`;
        await expect(unsealSession(tampered)).resolves.toBeUndefined();
    });

    it("ignores a cookie sealed with another secret", async () => {
        const sealed = await sealSession(session);
        vi.stubEnv("SESSION_SECRET", "another-secret-for-the-tests-of-32-chars");
        await expect(unsealSession(sealed)).resolves.toBeUndefined();
    });

    it("refuses a short secret", async () => {
        vi.stubEnv("SESSION_SECRET", "too-short");
        await expect(sealSession(session)).rejects.toThrow(/32 characters/);
    });

    it("refreshes the access token shortly before it expires", () => {
        const now = session.expiresAt * 1000;
        expect(needsRefresh(session, now - 5 * 60 * 1000)).toBe(false);
        expect(needsRefresh(session, now - 30 * 1000)).toBe(true);
        expect(needsRefresh(session, now + 1000)).toBe(true);
    });
});

describe("session cookies", () => {
    function cookieList(cookies: Record<string, string>) {
        return { getAll: () => Object.entries(cookies).map(([name, value]) => ({ name, value })) };
    }

    it("splits a large session into chunks and joins them again", () => {
        const sealed = "x".repeat(3800) + "y".repeat(500);
        const chunks = splitSessionCookies(sealed);
        expect(chunks.map(({ name, value }) => [name, value.length])).toEqual([
            ["plannr_session.0", 3800],
            ["plannr_session.1", 500],
        ]);
        // Out of order and next to other cookies
        expect(readSessionCookies(cookieList({ theme: "dark", [chunks[1].name]: chunks[1].value, [chunks[0].name]: chunks[0].value }))).toBe(sealed);
    });

    it("has no session without its cookies", () => {
        expect(readSessionCookies(cookieList({ theme: "dark" }))).toBeUndefined();
    });

    it("removes the chunks the new session no longer needs", () => {
        const previous = cookieList({ "plannr_session.0": "a", "plannr_session.1": "b", "plannr_session.2": "c", theme: "dark" });
        expect(staleSessionCookieNames(previous, "short")).toEqual(["plannr_session.1", "plannr_session.2"]);
        expect(staleSessionCookieNames(previous)).toEqual(["plannr_session.0", "plannr_session.1", "plannr_session.2"]);
    });
});
