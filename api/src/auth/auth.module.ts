import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { UsersModule } from "@src/users/users.module.js";

import { DevelopmentUserGuard } from "./development-user.guard.js";

@Module({
    imports: [UsersModule],
    providers: [{ provide: APP_GUARD, useClass: DevelopmentUserGuard }],
})
export class AuthModule {}
