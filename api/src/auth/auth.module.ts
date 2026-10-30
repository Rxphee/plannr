import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ApiTokensModule } from "@src/api-tokens/api-tokens.module.js";
import { UsersModule } from "@src/users/users.module.js";

import { DevelopmentUserGuard } from "./development-user.guard.js";

@Module({
    imports: [UsersModule, ApiTokensModule],
    providers: [{ provide: APP_GUARD, useClass: DevelopmentUserGuard }],
})
export class AuthModule {}
