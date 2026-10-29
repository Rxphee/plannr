import { MikroORM } from "@mikro-orm/postgresql";
import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module.js";
import { createConfig } from "./config/config.js";

// Entry point for maintenance commands, e.g. `node dist/console.js migrate`.
// Booting the app module also writes schema.gql in development, which `lint:api-can-start` relies on.
const commands: Record<string, { description: string; run: (orm: MikroORM) => Promise<void> }> = {
    migrate: {
        description: "Runs all pending migrations",
        run: async (orm) => {
            await orm.migrator.up();
        },
    },
};

async function bootstrap(): Promise<void> {
    const logger = new Logger("console");
    const [commandName] = process.argv.slice(2);
    const app = await NestFactory.createApplicationContext(AppModule.forRoot(createConfig(process.env)), { logger: ["error", "warn", "log"] });

    try {
        await app.init();

        const command = commandName ? commands[commandName] : undefined;
        if (!command) {
            logger.log(
                `Available commands:\n${Object.entries(commands)
                    .map(([name, { description }]) => `  ${name}  ${description}`)
                    .join("\n")}`,
            );
            process.exitCode = commandName && commandName !== "--help" ? 1 : 0;
            return;
        }

        logger.log(`Running ${commandName}...`);
        await command.run(app.get(MikroORM));
        logger.log(`${commandName} finished`);
    } catch (error) {
        logger.error(error);
        process.exitCode = 1;
    } finally {
        await app.close();
    }
}

bootstrap();
