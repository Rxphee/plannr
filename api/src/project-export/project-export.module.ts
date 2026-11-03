import { Module } from "@nestjs/common";
import { ProjectsModule } from "@src/projects/projects.module.js";

import { ProjectExportController } from "./project-export.controller.js";
import { ProjectExportService } from "./project-export.service.js";

@Module({ imports: [ProjectsModule], controllers: [ProjectExportController], providers: [ProjectExportService] })
export class ProjectExportModule {}
