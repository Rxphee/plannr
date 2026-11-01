import { describe, expect, it } from "vitest";

import { isValidProjectKey } from "./projectValidation";

describe("isValidProjectKey", () => {
    it.each(["PL", "PLAN", "PLANR"])("accepts %j", (key) => {
        expect(isValidProjectKey(key)).toBe(true);
    });

    it.each(["P", "PLANNR", "PL4N", "plan"])("rejects %j", (key) => {
        expect(isValidProjectKey(key)).toBe(false);
    });

    // An empty key is the job of the required check
    it("leaves an empty key alone", () => {
        expect(isValidProjectKey(undefined)).toBe(true);
    });
});
