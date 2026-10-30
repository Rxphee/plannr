import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable } from "@nestjs/common";
import { Label, LabelColor } from "@src/labels/entities/label.entity.js";

export type FixtureLabels = Record<"upstream" | "design" | "frontend" | "backend" | "customer" | "documentation", Label>;

const labelColors: Record<keyof FixtureLabels, LabelColor> = {
    upstream: LabelColor.red,
    design: LabelColor.violet,
    frontend: LabelColor.blue,
    backend: LabelColor.teal,
    customer: LabelColor.amber,
    documentation: LabelColor.gray,
};

@Injectable()
export class LabelsFixtureService {
    constructor(private readonly entityManager: EntityManager) {}

    // Created without LabelsService, which only lets admins create labels, and the fixtures have no admin
    async generateLabels(): Promise<FixtureLabels> {
        const labels = Object.fromEntries(
            Object.entries(labelColors).map(([name, color]) => [name, this.entityManager.create(Label, { name, color })]),
        ) as FixtureLabels;
        await this.entityManager.flush();
        return labels;
    }
}
