import { Module } from "@nestjs/common";

import { StatusResolver } from "./status.resolver.js";

@Module({ providers: [StatusResolver] })
export class StatusModule {}
