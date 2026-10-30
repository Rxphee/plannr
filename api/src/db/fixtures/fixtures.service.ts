import { CreateRequestContext } from "@mikro-orm/decorators/legacy";
import { MikroORM } from "@mikro-orm/postgresql";
import { Injectable, Logger } from "@nestjs/common";

import { ApiTokensFixtureService } from "./api-tokens-fixture.service.js";
import { EpicsFixtureService } from "./epics-fixture.service.js";
import { IssuesFixtureService } from "./issues-fixture.service.js";
import { LabelsFixtureService } from "./labels-fixture.service.js";
import { ProjectsFixtureService } from "./projects-fixture.service.js";
import { UsersFixtureService } from "./users-fixture.service.js";

@Injectable()
export class FixturesService {
    private readonly logger = new Logger(FixturesService.name);

    constructor(
        private readonly orm: MikroORM,
        private readonly usersFixtureService: UsersFixtureService,
        private readonly projectsFixtureService: ProjectsFixtureService,
        private readonly epicsFixtureService: EpicsFixtureService,
        private readonly labelsFixtureService: LabelsFixtureService,
        private readonly issuesFixtureService: IssuesFixtureService,
        private readonly apiTokensFixtureService: ApiTokensFixtureService,
    ) {}

    // Resets the database and fills it with demo data for development
    @CreateRequestContext()
    async run(): Promise<void> {
        if (process.env.NODE_ENV === "production") {
            throw new Error("Fixtures drop all tables and must never run in production");
        }

        this.logger.log("Drop tables...");
        const connection = this.orm.em.getConnection();
        const tables = await connection.execute<{ tablename: string }[]>(
            "SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' ORDER BY tablename",
        );
        for (const { tablename } of tables) {
            await connection.execute(`DROP TABLE IF EXISTS "${tablename}" CASCADE`);
        }

        this.logger.log("Run migrations...");
        const executedMigrations = await this.orm.migrator.up();
        if (executedMigrations.length === 0) {
            // Leaves an empty database, e.g. to create the initial migration again
            this.logger.warn("There are no migrations, the database stays empty");
            return;
        }

        this.logger.log("Generate users...");
        const users = await this.usersFixtureService.generateUsers();

        this.logger.log("Generate projects...");
        const projects = await this.projectsFixtureService.generateProjects(users);

        this.logger.log("Generate epics...");
        const epics = await this.epicsFixtureService.generateEpics(projects, users.developmentUser);

        this.logger.log("Generate labels...");
        const labels = await this.labelsFixtureService.generateLabels(users.admin);

        this.logger.log("Generate issues...");
        await this.issuesFixtureService.generateIssues(epics, users, labels);

        this.logger.log("Archive projects...");
        await this.projectsFixtureService.archiveProjects(projects, users.developmentUser);

        this.logger.log("Generate API tokens...");
        await this.apiTokensFixtureService.generateApiTokens(users.developmentUser);
    }
}
