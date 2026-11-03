import { type DynamicModule, Module } from "@nestjs/common";
import type { Config } from "@src/config/config.js";

import { StorageService } from "./storage.service.js";

// Global, so feature modules can store files without passing the config on
@Module({})
export class StorageModule {
    static forRoot(config: Config): DynamicModule {
        return {
            module: StorageModule,
            global: true,
            providers: [{ provide: StorageService, useValue: new StorageService(config.storage) }],
            exports: [StorageService],
        };
    }
}
