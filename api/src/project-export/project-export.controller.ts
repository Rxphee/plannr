import { Controller, Get, Header, Param, StreamableFile } from "@nestjs/common";
import { CurrentUser } from "@src/auth/current-user.decorator.js";
import type { User } from "@src/users/user.entity.js";

import { ProjectExportService } from "./project-export.service.js";
import { projectExportFileName } from "./project-export-format.js";

// REST instead of GraphQL, so the web app can pass the file on as a download and scripts can fetch it with an API token
@Controller()
export class ProjectExportController {
    constructor(private readonly projectExportService: ProjectExportService) {}

    @Get("projects/:key/export")
    @Header("cache-control", "no-store")
    async export(@Param("key") key: string, @CurrentUser() user: User): Promise<StreamableFile> {
        const projectExport = await this.projectExportService.exportProject(key, user);
        return new StreamableFile(Buffer.from(JSON.stringify(projectExport, null, 4)), {
            type: "application/json; charset=utf-8",
            disposition: `attachment; filename="${projectExportFileName(projectExport)}"`,
        });
    }
}
