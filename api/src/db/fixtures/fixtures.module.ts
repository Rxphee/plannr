import { Module } from "@nestjs/common";
import { EpicsModule } from "@src/epics/epics.module.js";
import { IssuesModule } from "@src/issues/issues.module.js";
import { ProjectsModule } from "@src/projects/projects.module.js";
import { UsersModule } from "@src/users/users.module.js";

import { EpicsFixtureService } from "./epics-fixture.service.js";
import { FixturesService } from "./fixtures.service.js";
import { IssuesFixtureService } from "./issues-fixture.service.js";
import { ProjectsFixtureService } from "./projects-fixture.service.js";
import { UsersFixtureService } from "./users-fixture.service.js";

@Module({
    imports: [UsersModule, ProjectsModule, EpicsModule, IssuesModule],
    providers: [FixturesService, UsersFixtureService, ProjectsFixtureService, EpicsFixtureService, IssuesFixtureService],
})
export class FixturesModule {}
