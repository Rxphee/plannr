import { type DynamicModule, Module } from "@nestjs/common";
import type { Config } from "@src/config/config.js";

import { InstanceRolesService } from "./instance-roles.service.js";

// Global, as every module that checks rights needs the instance roles
@Module({})
export class InstanceRolesModule {
    static forRoot(config: Config): DynamicModule {
        return {
            module: InstanceRolesModule,
            global: true,
            providers: [{ provide: InstanceRolesService, useValue: new InstanceRolesService(config.superAdminEmails) }],
            exports: [InstanceRolesService],
        };
    }
}
