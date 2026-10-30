import { Injectable } from "@nestjs/common";
import { type Label, LabelColor } from "@src/labels/entities/label.entity.js";
import { LabelsService } from "@src/labels/labels.service.js";
import type { User } from "@src/users/user.entity.js";

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
    constructor(private readonly labelsService: LabelsService) {}

    // Only admins manage labels
    async generateLabels(admin: User): Promise<FixtureLabels> {
        const labels: Partial<FixtureLabels> = {};
        for (const [name, color] of Object.entries(labelColors) as [keyof FixtureLabels, LabelColor][]) {
            labels[name] = await this.labelsService.create({ name, color }, admin);
        }
        return labels as FixtureLabels;
    }
}
