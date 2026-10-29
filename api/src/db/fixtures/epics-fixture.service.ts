import { Injectable } from "@nestjs/common";
import type { Epic } from "@src/epics/entities/epic.entity.js";
import { EpicsService } from "@src/epics/epics.service.js";
import type { Project } from "@src/projects/entities/project.entity.js";
import type { User } from "@src/users/user.entity.js";

import type { FixtureProjects } from "./projects-fixture.service.js";

export interface FixtureEpics {
    website: { general: Epic; design: Epic; content: Epic; launch: Epic };
    app: { general: Epic; offline: Epic; onboarding: Epic };
    holiday: { general: Epic };
}

@Injectable()
export class EpicsFixtureService {
    constructor(private readonly epicsService: EpicsService) {}

    async generateEpics({ website, app, holiday }: FixtureProjects, user: User): Promise<FixtureEpics> {
        return {
            website: {
                general: await this.epicsService.findDefault(website),
                design: await this.createEpic(
                    website,
                    user,
                    "Design",
                    "Layout, colors and components of the new site.\n\n- [x] Moodboard\n- [ ] Design system",
                ),
                content: await this.createEpic(website, user, "Content", "Copy and images for every page, reviewed by marketing."),
                launch: await this.createEpic(website, user, "Launch", ""),
            },
            app: {
                general: await this.epicsService.findDefault(app),
                offline: await this.createEpic(app, user, "Offline Mode", "The app keeps working without a connection and syncs later."),
                onboarding: await this.createEpic(app, user, "Onboarding", ""),
            },
            holiday: { general: await this.epicsService.findDefault(holiday) },
        };
    }

    private async createEpic(project: Project, user: User, name: string, description: string): Promise<Epic> {
        return this.epicsService.create({ projectId: project.id, name, description }, user);
    }
}
