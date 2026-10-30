import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ApiTokenAuthenticator } from "@src/api-tokens/api-token.authenticator.js";
import { UsersService } from "@src/users/users.service.js";

import { IS_PUBLIC_KEY } from "./public.decorator.js";
import { getRequest } from "./request-with-user.js";

// Logs every request without an API token in as the fixed development user. Replaced by the OIDC login, so it must never run in production.
@Injectable()
export class DevelopmentUserGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly usersService: UsersService,
        private readonly apiTokenAuthenticator: ApiTokenAuthenticator,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) {
            return true;
        }
        const request = getRequest(context);
        // Runs before any other login, in production too
        const apiTokenUser = await this.apiTokenAuthenticator.authenticate(request);
        if (apiTokenUser) {
            request.user = apiTokenUser;
            return true;
        }

        if (process.env.NODE_ENV === "production") {
            throw new UnauthorizedException("No login is configured");
        }

        request.user = await this.usersService.findOrCreateDevelopmentUser();
        return true;
    }
}
