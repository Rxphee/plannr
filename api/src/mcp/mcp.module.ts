import { Module } from "@nestjs/common";
import { EpicsModule } from "@src/epics/epics.module.js";
import { IssuesModule } from "@src/issues/issues.module.js";
import { LabelsModule } from "@src/labels/labels.module.js";
import { ProjectsModule } from "@src/projects/projects.module.js";

import { McpController } from "./mcp.controller.js";
import { McpToolsService } from "./mcp-tools.service.js";

@Module({ imports: [ProjectsModule, EpicsModule, IssuesModule, LabelsModule], controllers: [McpController], providers: [McpToolsService] })
export class McpModule {}
