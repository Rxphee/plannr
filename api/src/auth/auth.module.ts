import { type DynamicModule, Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ApiTokenAuthenticator } from "@src/api-tokens/api-token.authenticator.js";
import { ApiTokensModule } from "@src/api-tokens/api-tokens.module.js";
import type { Config } from "@src/config/config.js";
import { UsersModule } from "@src/users/users.module.js";

import { AuthGuard } from "./auth.guard.js";
import { AUTH_STRATEGIES, type AuthStrategy } from "./auth-strategy.js";
import { OidcAuthStrategy } from "./oidc/oidc-auth.strategy.js";
import { OidcIssuer } from "./oidc/oidc-issuer.js";

@Module({})
export class AuthModule {
    static forRoot(config: Config): DynamicModule {
        return {
            module: AuthModule,
            imports: [UsersModule, ApiTokensModule],
            providers: [
                { provide: OidcIssuer, useValue: new OidcIssuer(config.oidc) },
                OidcAuthStrategy,
                {
                    provide: AUTH_STRATEGIES,
                    // Tried in this order: a personal API token first, so a wrong one is refused instead of falling back to the OIDC login
                    useFactory: (apiTokenAuthenticator: ApiTokenAuthenticator, oidcAuthStrategy: OidcAuthStrategy): AuthStrategy[] => [
                        apiTokenAuthenticator,
                        oidcAuthStrategy,
                    ],
                    inject: [ApiTokenAuthenticator, OidcAuthStrategy],
                },
                { provide: APP_GUARD, useClass: AuthGuard },
            ],
        };
    }
}
