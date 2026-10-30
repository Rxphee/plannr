import { ParseUUIDPipe } from "@nestjs/common";
import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "@src/auth/current-user.decorator.js";
import { Epic } from "@src/epics/entities/epic.entity.js";
import { Label } from "@src/labels/entities/label.entity.js";
import { Project } from "@src/projects/entities/project.entity.js";
import { User } from "@src/users/user.entity.js";

import { CreateIssueInput } from "./dto/create-issue.input.js";
import { IssuesArgs } from "./dto/issues.args.js";
import { PaginatedIssues } from "./dto/paginated-issues.js";
import { UpdateIssueInput } from "./dto/update-issue.input.js";
import { Issue } from "./entities/issue.entity.js";
import { IssueLink } from "./entities/issue-link.entity.js";
import { IssuesService } from "./issues.service.js";

@Resolver(() => Issue)
export class IssuesResolver {
    constructor(private readonly issuesService: IssuesService) {}

    @Query(() => PaginatedIssues, {
        description: "Issues of a project or of all projects, newest first, the view of due issues the soonest due first",
    })
    async issues(@Args() args: IssuesArgs, @CurrentUser() user: User): Promise<PaginatedIssues> {
        return this.issuesService.findAll(args, user);
    }

    @Query(() => Issue, { nullable: true, description: "The issue with the key, e.g. KEY-42, if the current user can see its project" })
    async issue(@Args("key") key: string, @CurrentUser() user: User): Promise<Issue | null> {
        return this.issuesService.findOneByKeyVisibleTo(key, user);
    }

    @Mutation(() => Issue)
    async createIssue(@Args("input") input: CreateIssueInput, @CurrentUser() user: User): Promise<Issue> {
        return this.issuesService.create(input, user);
    }

    @Mutation(() => Issue)
    async updateIssue(
        @Args("id", { type: () => ID }, new ParseUUIDPipe({ version: "4" })) id: string,
        @Args("input") input: UpdateIssueInput,
        @CurrentUser() user: User,
    ): Promise<Issue> {
        return this.issuesService.update(id, input, user);
    }

    @Mutation(() => Boolean)
    async deleteIssue(@Args("id", { type: () => ID }, new ParseUUIDPipe({ version: "4" })) id: string, @CurrentUser() user: User): Promise<boolean> {
        await this.issuesService.delete(id, user);
        return true;
    }

    @ResolveField(() => String, { description: "The key of the project and the number, e.g. KEY-42" })
    async key(@Parent() issue: Issue): Promise<string> {
        const project = await issue.project.loadOrFail();
        return `${project.key}-${issue.number}`;
    }

    @ResolveField(() => Project)
    async project(@Parent() issue: Issue): Promise<Project> {
        return issue.project.loadOrFail();
    }

    @ResolveField(() => Epic)
    async epic(@Parent() issue: Issue): Promise<Epic> {
        return issue.epic.loadOrFail();
    }

    @ResolveField(() => User)
    async createdBy(@Parent() issue: Issue): Promise<User> {
        return issue.createdBy.loadOrFail();
    }

    @ResolveField(() => [Label], { description: "Sorted by name" })
    async labels(@Parent() issue: Issue): Promise<Label[]> {
        return issue.labels.loadItems();
    }

    @ResolveField(() => [IssueLink], { description: "Oldest first" })
    async links(@Parent() issue: Issue): Promise<IssueLink[]> {
        return issue.links.loadItems();
    }
}
