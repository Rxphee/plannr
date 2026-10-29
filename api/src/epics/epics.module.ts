import { Module } from "@nestjs/common";
import { ProjectsModule } from "@src/projects/projects.module.js";

import { EpicsResolver } from "./epics.resolver.js";
import { EpicsService } from "./epics.service.js";

@Module({ imports: [ProjectsModule], providers: [EpicsResolver, EpicsService], exports: [EpicsService] })
export class EpicsModule {}
