import { ParseUUIDPipe } from "@nestjs/common";
import { Args, ID, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "@src/auth/current-user.decorator.js";
import { Project } from "@src/projects/entities/project.entity.js";
import type { User } from "@src/users/user.entity.js";

import { CreateEpicInput } from "./dto/create-epic.input.js";
import { EpicsArgs } from "./dto/epics.args.js";
import { PaginatedEpics } from "./dto/paginated-epics.js";
import { UpdateEpicInput } from "./dto/update-epic.input.js";
import { Epic } from "./entities/epic.entity.js";
import { EpicsService } from "./epics.service.js";

@Resolver(() => Epic)
export class EpicsResolver {
    constructor(private readonly epicsService: EpicsService) {}

    @Query(() => PaginatedEpics, { description: "Epics of a project, General first, then by name" })
    async epics(@Args() args: EpicsArgs, @CurrentUser() user: User): Promise<PaginatedEpics> {
        return this.epicsService.findAll(args, user);
    }

    @Query(() => Epic, { nullable: true, description: "The epic, if the current user can see its project" })
    async epic(@Args("id", { type: () => ID }, new ParseUUIDPipe({ version: "4" })) id: string, @CurrentUser() user: User): Promise<Epic | null> {
        return this.epicsService.findOneVisibleTo(id, user);
    }

    @Mutation(() => Epic)
    async createEpic(@Args("input") input: CreateEpicInput, @CurrentUser() user: User): Promise<Epic> {
        return this.epicsService.create(input, user);
    }

    @Mutation(() => Epic)
    async updateEpic(
        @Args("id", { type: () => ID }, new ParseUUIDPipe({ version: "4" })) id: string,
        @Args("input") input: UpdateEpicInput,
        @CurrentUser() user: User,
    ): Promise<Epic> {
        return this.epicsService.update(id, input, user);
    }

    @Mutation(() => Boolean, { description: "Moves the issues of the epic to another epic of the project, or deletes them without one" })
    async deleteEpic(
        @Args("id", { type: () => ID }, new ParseUUIDPipe({ version: "4" })) id: string,
        @Args("moveIssuesToEpicId", { type: () => ID, nullable: true }, new ParseUUIDPipe({ version: "4", optional: true }))
        moveIssuesToEpicId: string | null | undefined,
        @CurrentUser() user: User,
    ): Promise<boolean> {
        await this.epicsService.delete(id, moveIssuesToEpicId, user);
        return true;
    }

    @ResolveField(() => Project)
    async project(@Parent() epic: Epic): Promise<Project> {
        return epic.project.loadOrFail();
    }
}
