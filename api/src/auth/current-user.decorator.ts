import { createParamDecorator, type ExecutionContext, UnauthorizedException } from "@nestjs/common";
import type { User } from "@src/users/user.entity.js";

import { getRequest } from "./request-with-user.js";

export const CurrentUser = createParamDecorator((data: unknown, context: ExecutionContext): User => {
    const { user } = getRequest(context);
    if (!user) {
        throw new UnauthorizedException();
    }
    return user;
});
