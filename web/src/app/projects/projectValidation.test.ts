import { describe, expect, it } from "vitest";

import { validateProjectKey } from "./projectValidation";

describe("validateProjectKey", () => {
    it.each(["PL", "PLAN", "PLANR"])("accepts %j", (key) => {
        expect(validateProjectKey(key)).toBeUndefined();
    });

    it.each(["P", "PLANNR", "PL4N", "plan"])("rejects %j", (key) => {
        expect(validateProjectKey(key)).toBe("2 to 5 uppercase letters");
    });

    // An empty key is the job of the required check
    it("leaves an empty key alone", () => {
        expect(validateProjectKey(undefined)).toBeUndefined();
    });
});
