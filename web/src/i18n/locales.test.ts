import { describe, expect, it } from "vitest";

import { negotiateLocale, parseLocalePreference } from "./locales";

describe("parseLocalePreference", () => {
    it("takes a supported language", () => {
        expect(parseLocalePreference("de")).toBe("de");
    });

    it.each([undefined, "", "fr", "system"])("follows the system for %s", (value) => {
        expect(parseLocalePreference(value)).toBe("system");
    });
});

describe("negotiateLocale", () => {
    it("takes the first supported language", () => {
        expect(negotiateLocale("de-AT,de;q=0.9,en;q=0.8")).toBe("de");
    });

    it("skips unsupported languages", () => {
        expect(negotiateLocale("fr-FR,fr;q=0.9,de;q=0.8,en;q=0.7")).toBe("de");
    });

    it("orders by quality", () => {
        expect(negotiateLocale("en;q=0.5,de;q=0.9")).toBe("de");
    });

    it("ignores languages with quality 0", () => {
        expect(negotiateLocale("de;q=0,en")).toBe("en");
    });

    it.each([null, "", "fr,es", "*"])("falls back to English for %s", (acceptLanguage) => {
        expect(negotiateLocale(acceptLanguage)).toBe("en");
    });
});
