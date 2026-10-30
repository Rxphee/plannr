import { describe, expect, it } from "vitest";

import { expiresAtOf, isExpired } from "./apiTokenExpiry";

const now = new Date("2026-10-30T12:00:00.000Z");

describe("expiresAtOf", () => {
    it("adds the days of the option", () => {
        expect(expiresAtOf("30", now)).toBe("2026-11-29T12:00:00.000Z");
        expect(expiresAtOf("365", now)).toBe("2027-10-30T12:00:00.000Z");
    });

    it("returns no date for a token without expiry", () => {
        expect(expiresAtOf("never", now)).toBeNull();
    });
});

describe("isExpired", () => {
    it("treats a token as expired from its expiry on", () => {
        expect(isExpired("2026-10-30T12:00:00.000Z", now)).toBe(true);
        expect(isExpired("2026-10-30T12:00:01.000Z", now)).toBe(false);
    });

    it("never expires a token without expiry", () => {
        expect(isExpired(null, now)).toBe(false);
    });
});
