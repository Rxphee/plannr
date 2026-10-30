import { type ExecutionContext, ForbiddenException } from "@nestjs/common";
import type { RequestWithUser } from "@src/auth/request-with-user.js";
import { describe, expect, it } from "vitest";

import type { ApiToken } from "./entities/api-token.entity.js";
import { RejectApiTokenGuard } from "./reject-api-token.guard.js";

function contextWith(request: RequestWithUser): ExecutionContext {
    return { getType: () => "http", switchToHttp: () => ({ getRequest: () => request }) } as unknown as ExecutionContext;
}

describe("RejectApiTokenGuard", () => {
    const guard = new RejectApiTokenGuard();

    it("lets in a user who logged in without an API token", () => {
        expect(guard.canActivate(contextWith({ headers: {} }))).toBe(true);
    });

    it("refuses a request with an API token", () => {
        expect(() => guard.canActivate(contextWith({ headers: {}, apiToken: {} as ApiToken }))).toThrow(ForbiddenException);
    });
});
