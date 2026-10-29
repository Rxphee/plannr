import { TSMigrationGenerator } from "@mikro-orm/migrations";

// Migrations only go up, a broken one is fixed by a new migration, so no down() is generated
export class MigrationGenerator extends TSMigrationGenerator {
    override generateMigrationFile(className: string, diff: { up: string[]; down: string[] }): string {
        return super.generateMigrationFile(className, { ...diff, down: [] });
    }
}
