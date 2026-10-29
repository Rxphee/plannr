import { Module } from "@nestjs/common";
import { ProjectsModule } from "@src/projects/projects.module.js";
import { UsersModule } from "@src/users/users.module.js";

import { FixturesService } from "./fixtures.service.js";
import { ProjectsFixtureService } from "./projects-fixture.service.js";
import { UsersFixtureService } from "./users-fixture.service.js";

@Module({
    imports: [UsersModule, ProjectsModule],
    providers: [FixturesService, UsersFixtureService, ProjectsFixtureService],
})
export class FixturesModule {}
