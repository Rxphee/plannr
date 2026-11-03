import { Controller, Get, Header, Param, StreamableFile } from "@nestjs/common";
import { CurrentUser } from "@src/auth/current-user.decorator.js";
import type { User } from "@src/users/user.entity.js";

import { ProjectExportService } from "./project-export.service.js";

// REST instead of GraphQL, so the web app can pass the file on as a download and scripts can fetch it with an API token
@Controller()
export class ProjectExportController {
    constructor(private readonly projectExportService: ProjectExportService) {}

    @Get("projects/:key/export")
    @Header("cache-control", "no-store")
    async export(@Param("key") key: string, @CurrentUser() user: User): Promise<StreamableFile> {
        const { fileName, content } = await this.projectExportService.createArchive(key, user);
        return new StreamableFile(content, { type: "application/zip", disposition: `attachment; filename="${fileName}"` });
    }
}
