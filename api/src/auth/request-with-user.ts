import type { IncomingHttpHeaders } from "node:http";

import type { ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import type { ApiToken } from "@src/api-tokens/entities/api-token.entity.js";
import type { User } from "@src/users/user.entity.js";

// Only the part of the Express request that the auth code needs
export type RequestWithUser = {
    headers: IncomingHttpHeaders;
    user?: User;
    // Set when an API token logged the user in
    apiToken?: ApiToken;
};

export function getRequest(context: ExecutionContext): RequestWithUser {
    if (context.getType<"graphql">() === "graphql") {
        return GqlExecutionContext.create(context).getContext<{ req: RequestWithUser }>().req;
    }
    return context.switchToHttp().getRequest<RequestWithUser>();
}
