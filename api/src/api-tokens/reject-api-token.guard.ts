import { type CanActivate, type ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { getRequest } from "@src/auth/request-with-user.js";

// Keeps API tokens away from the token management, so a leaked token cannot create new tokens that outlive its revocation
@Injectable()
export class RejectApiTokenGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        if (getRequest(context).apiToken) {
            throw new ForbiddenException("API tokens can only be managed after logging in to Plannr, not with an API token");
        }
        return true;
    }
}
