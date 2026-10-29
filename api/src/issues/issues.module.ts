import { Module } from "@nestjs/common";
import { EpicsModule } from "@src/epics/epics.module.js";
import { ProjectsModule } from "@src/projects/projects.module.js";

import { IssueLinksResolver } from "./issue-links.resolver.js";
import { IssuesResolver } from "./issues.resolver.js";
import { IssuesService } from "./issues.service.js";

@Module({ imports: [ProjectsModule, EpicsModule], providers: [IssuesResolver, IssueLinksResolver, IssuesService], exports: [IssuesService] })
export class IssuesModule {}
