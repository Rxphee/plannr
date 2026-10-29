import { ParseUUIDPipe } from "@nestjs/common";
import { Args, ID, Mutation, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "@src/auth/current-user.decorator.js";
import type { User } from "@src/users/user.entity.js";

import { IssueLinkInput } from "./dto/issue-link.input.js";
import { IssueLink } from "./entities/issue-link.entity.js";
import { IssuesService } from "./issues.service.js";

@Resolver(() => IssueLink)
export class IssueLinksResolver {
    constructor(private readonly issuesService: IssuesService) {}

    @Mutation(() => IssueLink)
    async addIssueLink(@Args("input") input: IssueLinkInput, @CurrentUser() user: User): Promise<IssueLink> {
        return this.issuesService.addLink(input, user);
    }

    @Mutation(() => Boolean)
    async removeIssueLink(
        @Args("id", { type: () => ID }, new ParseUUIDPipe({ version: "4" })) id: string,
        @CurrentUser() user: User,
    ): Promise<boolean> {
        await this.issuesService.removeLink(id, user);
        return true;
    }
}
