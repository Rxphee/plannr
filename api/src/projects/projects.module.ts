import { Module } from "@nestjs/common";

import { ProjectMembersResolver } from "./project-members.resolver.js";
import { ProjectsResolver } from "./projects.resolver.js";
import { ProjectsService } from "./projects.service.js";

@Module({ providers: [ProjectsResolver, ProjectMembersResolver, ProjectsService], exports: [ProjectsService] })
export class ProjectsModule {}
