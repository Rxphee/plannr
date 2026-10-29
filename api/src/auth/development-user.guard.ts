import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UsersService } from "@src/users/users.service.js";

import { IS_PUBLIC_KEY } from "./public.decorator.js";
import { getRequest } from "./request-with-user.js";

// Logs every request in as the fixed development user. Replaced by the OIDC login, so it must never run in production.
@Injectable()
export class DevelopmentUserGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly usersService: UsersService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        if (this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()])) {
            return true;
        }
        if (process.env.NODE_ENV === "production") {
            throw new UnauthorizedException("No login is configured");
        }

        getRequest(context).user = await this.usersService.findOrCreateDevelopmentUser();
        return true;
    }
}
