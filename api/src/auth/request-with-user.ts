import type { ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import type { User } from "@src/users/user.entity.js";

// Only the part of the Express request that the auth code needs
type RequestWithUser = { user?: User };

export function getRequest(context: ExecutionContext): RequestWithUser {
    if (context.getType<"graphql">() === "graphql") {
        return GqlExecutionContext.create(context).getContext<{ req: RequestWithUser }>().req;
    }
    return context.switchToHttp().getRequest<RequestWithUser>();
}
