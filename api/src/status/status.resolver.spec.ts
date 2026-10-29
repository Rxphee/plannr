import { describe, expect, it } from "vitest";

import { StatusResolver } from "./status.resolver.js";

describe("StatusResolver", () => {
    it("returns OK", () => {
        expect(new StatusResolver().status()).toBe("OK");
    });
});
