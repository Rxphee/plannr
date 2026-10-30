import { type CanActivate, type ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { getRequest } from "@src/auth/request-with-user.js";

// Keeps API tokens away from what a leaked token must not do: managing tokens, so it cannot create new ones that outlive its revocation,
// and appointing admins, so it cannot hand out admin rights
@Injectable()
export class RejectApiTokenGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        if (getRequest(context).apiToken) {
            throw new ForbiddenException("This is only possible after logging in to Plannr, not with an API token");
        }
        return true;
    }
}
