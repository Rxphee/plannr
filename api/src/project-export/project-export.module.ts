import { Module } from "@nestjs/common";
import { ImagesModule } from "@src/images/images.module.js";
import { ProjectsModule } from "@src/projects/projects.module.js";

import { ProjectExportController } from "./project-export.controller.js";
import { ProjectExportService } from "./project-export.service.js";

@Module({ imports: [ProjectsModule, ImagesModule], controllers: [ProjectExportController], providers: [ProjectExportService] })
export class ProjectExportModule {}
