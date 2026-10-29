import { Module } from "@nestjs/common";
import { ProjectsModule } from "@src/projects/projects.module.js";

import { EpicsResolver } from "./epics.resolver.js";
import { EpicsService } from "./epics.service.js";
import { ProjectEpicsResolver } from "./project-epics.resolver.js";

@Module({ imports: [ProjectsModule], providers: [EpicsResolver, ProjectEpicsResolver, EpicsService], exports: [EpicsService] })
export class EpicsModule {}
