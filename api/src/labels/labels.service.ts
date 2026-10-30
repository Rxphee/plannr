import { EntityManager, UniqueConstraintViolationException } from "@mikro-orm/postgresql";
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import type { PaginationArgs } from "@src/common/pagination.args.js";
import type { User } from "@src/users/user.entity.js";

import type { CreateLabelInput } from "./dto/create-label.input.js";
import type { PaginatedLabels } from "./dto/paginated-labels.js";
import type { UpdateLabelInput } from "./dto/update-label.input.js";
import { Label } from "./entities/label.entity.js";

@Injectable()
export class LabelsService {
    constructor(private readonly entityManager: EntityManager) {}

    // Sorted by name, then by ID, so that the order stays the same across pages
    async findAll({ offset, limit }: PaginationArgs): Promise<PaginatedLabels> {
        const [nodes, totalCount] = await this.entityManager.findAndCount(Label, {}, { orderBy: { name: "asc", id: "asc" }, offset, limit });
        return { nodes, totalCount };
    }

    // For the labels of an issue: all of them exist, or none is used
    async findByIds(ids: string[]): Promise<Label[]> {
        const uniqueIds = [...new Set(ids)];
        const labels = await this.entityManager.find(Label, { id: { $in: uniqueIds } });
        if (labels.length !== uniqueIds.length) {
            throw new BadRequestException("A label does not exist");
        }
        return labels;
    }

    // Labels belong to the whole instance, so only admins manage them
    canManage(user: User): boolean {
        return user.isAdmin;
    }

    async create(input: CreateLabelInput, user: User): Promise<Label> {
        this.assertCanManage(user);
        const label = this.entityManager.create(Label, input);
        await this.flushUniqueName(input.name);
        return label;
    }

    async update(id: string, { name, color }: UpdateLabelInput, user: User): Promise<Label> {
        this.assertCanManage(user);
        const label = await this.findOneOrFail(id);
        if (name !== undefined) {
            label.name = name;
        }
        if (color !== undefined) {
            label.color = color;
        }
        await this.flushUniqueName(label.name);
        return label;
    }

    // Removes the label from all issues that have it
    async delete(id: string, user: User): Promise<void> {
        this.assertCanManage(user);
        const label = await this.findOneOrFail(id);
        await this.entityManager.remove(label).flush();
    }

    private assertCanManage(user: User): void {
        if (!this.canManage(user)) {
            throw new ForbiddenException("Only admins can manage labels");
        }
    }

    private async findOneOrFail(id: string): Promise<Label> {
        const label = await this.entityManager.findOne(Label, id);
        if (!label) {
            throw new NotFoundException("The label does not exist");
        }
        return label;
    }

    private async flushUniqueName(name: string): Promise<void> {
        try {
            await this.entityManager.flush();
        } catch (error) {
            if (error instanceof UniqueConstraintViolationException) {
                throw new BadRequestException(`The label ${name} already exists`);
            }
            throw error;
        }
    }
}
