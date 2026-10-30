import type { User } from "@src/users/user.entity.js";

import type { RequestWithUser } from "./request-with-user.js";

// One way to log in: the personal API tokens (ApiTokenAuthenticator) and the access token of the OIDC login (OidcAuthStrategy)
export interface AuthStrategy {
    // Returns undefined if the request carries no credential of this kind, so that the next strategy can try.
    // Throws an UnauthorizedException if it carries one that is invalid.
    authenticate(request: RequestWithUser): Promise<User | undefined>;
}

export const AUTH_STRATEGIES = Symbol("AUTH_STRATEGIES");
