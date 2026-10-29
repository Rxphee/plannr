import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { Project } from "@src/projects/entities/project.entity.js";

import { Epic } from "./entities/epic.entity.js";
import { EpicsService } from "./epics.service.js";

// Lives here instead of in the projects module, which the epics module already depends on
@Resolver(() => Project)
export class ProjectEpicsResolver {
    constructor(private readonly epicsService: EpicsService) {}

    @ResolveField(() => [Epic], { description: "General first, then by name" })
    async epics(@Parent() project: Project): Promise<Epic[]> {
        return this.epicsService.findAll(project);
    }
}
