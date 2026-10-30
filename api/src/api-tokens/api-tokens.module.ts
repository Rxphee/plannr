import { Module } from "@nestjs/common";

import { ApiTokensResolver } from "./api-tokens.resolver.js";
import { ApiTokensService } from "./api-tokens.service.js";

@Module({ providers: [ApiTokensResolver, ApiTokensService], exports: [ApiTokensService] })
export class ApiTokensModule {}
