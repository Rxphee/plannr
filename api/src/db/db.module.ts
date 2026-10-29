import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Module } from "@nestjs/common";

import { ormConfig } from "./ormconfig.js";

@Module({
    imports: [MikroOrmModule.forRoot(ormConfig)],
})
export class DbModule {}
