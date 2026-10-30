import { ParseUUIDPipe } from "@nestjs/common";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { CurrentUser } from "@src/auth/current-user.decorator.js";
import { PaginationArgs } from "@src/common/pagination.args.js";
import type { User } from "@src/users/user.entity.js";

import { CreateLabelInput } from "./dto/create-label.input.js";
import { PaginatedLabels } from "./dto/paginated-labels.js";
import { UpdateLabelInput } from "./dto/update-label.input.js";
import { Label } from "./entities/label.entity.js";
import { LabelsService } from "./labels.service.js";

@Resolver(() => Label)
export class LabelsResolver {
    constructor(private readonly labelsService: LabelsService) {}

    @Query(() => PaginatedLabels, { description: "The labels of the instance, sorted by name" })
    async labels(@Args() args: PaginationArgs): Promise<PaginatedLabels> {
        return this.labelsService.findAll(args);
    }

    @Query(() => Boolean, { description: "Whether the current user can create, edit and delete labels" })
    canManageLabels(@CurrentUser() user: User): boolean {
        return this.labelsService.canManage(user);
    }

    @Mutation(() => Label)
    async createLabel(@Args("input") input: CreateLabelInput, @CurrentUser() user: User): Promise<Label> {
        return this.labelsService.create(input, user);
    }

    @Mutation(() => Label)
    async updateLabel(
        @Args("id", { type: () => ID }, new ParseUUIDPipe({ version: "4" })) id: string,
        @Args("input") input: UpdateLabelInput,
        @CurrentUser() user: User,
    ): Promise<Label> {
        return this.labelsService.update(id, input, user);
    }

    @Mutation(() => Boolean, { description: "Deletes the label and removes it from all issues" })
    async deleteLabel(@Args("id", { type: () => ID }, new ParseUUIDPipe({ version: "4" })) id: string, @CurrentUser() user: User): Promise<boolean> {
        await this.labelsService.delete(id, user);
        return true;
    }
}
