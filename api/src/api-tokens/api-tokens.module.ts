import { Module } from "@nestjs/common";

import { ApiTokenAuthenticator } from "./api-token.authenticator.js";
import { ApiTokensResolver } from "./api-tokens.resolver.js";
import { ApiTokensService } from "./api-tokens.service.js";

@Module({ providers: [ApiTokensResolver, ApiTokensService, ApiTokenAuthenticator], exports: [ApiTokensService, ApiTokenAuthenticator] })
export class ApiTokensModule {}
