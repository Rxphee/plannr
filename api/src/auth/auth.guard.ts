import { type CanActivate, type ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { AUTH_STRATEGIES, type AuthStrategy } from "./auth-strategy.js";
import { IS_PUBLIC_KEY } from "./public.decorator.js";
import { getRequest } from "./request-with-user.js";

// Logs every request in with the first strategy that recognizes its credential
@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        @Inject(AUTH_STRATEGIES) private readonly strategies: AuthStrategy[],
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) {
            return true;
        }

        const request = getRequest(context);
        // The guard runs for every root field of a GraphQL request, the login only once
        if (request.user) {
            return true;
        }

        for (const strategy of this.strategies) {
            const user = await strategy.authenticate(request);
            if (user) {
                request.user = user;
                return true;
            }
        }
        throw new UnauthorizedException("Login required");
    }
}
