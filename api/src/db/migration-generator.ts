import { MigrationGenerator as BaseMigrationGenerator, TSMigrationGenerator } from "@mikro-orm/migrations";

// Extends the base class instead of TSMigrationGenerator, whose generateMigrationFile() must return synchronously,
// while formatting with Prettier is asynchronous. The TypeScript template is reused from TSMigrationGenerator.
export class MigrationGenerator extends BaseMigrationGenerator {
    override async generateMigrationFile(className: string, diff: { up: string[]; down: string[] }): Promise<string> {
        // Migrations only go up, a broken one is fixed by a new migration, so no down() is generated
        const source = TSMigrationGenerator.prototype.generateMigrationFile.call(this, className, { ...diff, down: [] });

        // MikroORM writes its own code style, so the file is formatted like the rest of the code.
        // Prettier is a dev dependency and only needed when generating, so production never loads it.
        const prettier = await import("prettier");
        const options = await prettier.resolveConfig(import.meta.filename);

        return prettier.format(source, { ...options, parser: "typescript" });
    }
}
