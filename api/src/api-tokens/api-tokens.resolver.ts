import { ParseUUIDPipe, UseGuards } from "@nestjs/common";
import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "@src/auth/current-user.decorator.js";
import { PaginationArgs } from "@src/common/pagination.args.js";
import type { User } from "@src/users/user.entity.js";

import { API_TOKEN_PREFIX } from "./api-token-secret.js";
import { ApiTokensService } from "./api-tokens.service.js";
import { CreateApiTokenInput } from "./dto/create-api-token.input.js";
import { CreatedApiToken } from "./dto/created-api-token.js";
import { PaginatedApiTokens } from "./dto/paginated-api-tokens.js";
import { ApiToken } from "./entities/api-token.entity.js";
import { RejectApiTokenGuard } from "./reject-api-token.guard.js";

@Resolver(() => ApiToken)
@UseGuards(RejectApiTokenGuard)
export class ApiTokensResolver {
    constructor(private readonly apiTokensService: ApiTokensService) {}

    @Query(() => PaginatedApiTokens, { description: "The API tokens of the current user that are not revoked, newest first" })
    async apiTokens(@Args() args: PaginationArgs, @CurrentUser() user: User): Promise<PaginatedApiTokens> {
        return this.apiTokensService.findAll(args, user);
    }

    @Mutation(() => CreatedApiToken, { description: "Creates an API token that logs in the current user" })
    async createApiToken(@Args("input") input: CreateApiTokenInput, @CurrentUser() user: User): Promise<CreatedApiToken> {
        return this.apiTokensService.create(input, user);
    }

    @Mutation(() => Boolean, { description: "Revokes an API token of the current user, every request with it fails from now on" })
    async revokeApiToken(
        @Args("id", { type: () => ID }, new ParseUUIDPipe({ version: "4" })) id: string,
        @CurrentUser() user: User,
    ): Promise<boolean> {
        await this.apiTokensService.revoke(id, user);
        return true;
    }

    @ResolveField(() => String, { description: "The start of the token without the secret, to recognize it" })
    prefix(@Parent() apiToken: ApiToken): string {
        return `${API_TOKEN_PREFIX}${apiToken.lookupId}`;
    }
}
