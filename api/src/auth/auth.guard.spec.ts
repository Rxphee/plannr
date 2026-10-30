import { type ExecutionContext, UnauthorizedException } from "@nestjs/common";
import type { Reflector } from "@nestjs/core";
import type { User } from "@src/users/user.entity.js";
import { describe, expect, it, vi } from "vitest";

import { AuthGuard } from "./auth.guard.js";
import type { AuthStrategy } from "./auth-strategy.js";
import type { RequestWithUser } from "./request-with-user.js";

const user = { id: "1" } as User;

function createContext(request: RequestWithUser): ExecutionContext {
    return {
        getType: () => "http",
        getHandler: () => undefined,
        getClass: () => undefined,
        switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
}

function createGuard(strategies: AuthStrategy[], isPublic = false) {
    const reflector = { getAllAndOverride: () => isPublic } as unknown as Reflector;
    return new AuthGuard(reflector, strategies);
}

describe("AuthGuard", () => {
    it("lets public routes pass without login", async () => {
        const strategy = { authenticate: vi.fn() };
        await expect(createGuard([strategy], true).canActivate(createContext({ headers: {} }))).resolves.toBe(true);
        expect(strategy.authenticate).not.toHaveBeenCalled();
    });

    it("logs in with the first strategy that recognizes the credential", async () => {
        const request: RequestWithUser = { headers: {} };
        const second = { authenticate: vi.fn().mockResolvedValue(user) };
        const third = { authenticate: vi.fn() };

        await expect(
            createGuard([{ authenticate: vi.fn().mockResolvedValue(undefined) }, second, third]).canActivate(createContext(request)),
        ).resolves.toBe(true);

        expect(request.user).toBe(user);
        expect(third.authenticate).not.toHaveBeenCalled();
    });

    it("rejects a request that no strategy recognizes", async () => {
        const guard = createGuard([{ authenticate: vi.fn().mockResolvedValue(undefined) }]);
        await expect(guard.canActivate(createContext({ headers: {} }))).rejects.toThrow(UnauthorizedException);
    });

    it("logs in only once per request", async () => {
        const strategy = { authenticate: vi.fn() };
        await expect(createGuard([strategy]).canActivate(createContext({ headers: {}, user }))).resolves.toBe(true);
        expect(strategy.authenticate).not.toHaveBeenCalled();
    });
});
