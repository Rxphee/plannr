import type { NamingStrategy } from "@mikro-orm/core";
import type { AbstractSqlDriver } from "@mikro-orm/postgresql";
import { describe, expect, it } from "vitest";

import { MigrationGenerator } from "./migration-generator.js";

describe("MigrationGenerator", () => {
    const generator = new MigrationGenerator({} as AbstractSqlDriver, {} as NamingStrategy, {});

    it("generates up() only", async () => {
        const file = await generator.generateMigrationFile("Migration20261029000000", {
            up: ['create table "User" ("id" uuid not null);'],
            down: ['drop table "User";'],
        });

        expect(file).toContain('this.addSql(`create table "User" ("id" uuid not null);`);');
        expect(file).not.toContain("down()");
        expect(file).not.toContain("drop table");
    });

    it("formats the file with Prettier", async () => {
        const longStatement = `alter table "Issue" add column "someVeryLongColumnName" varchar(255) null, add column "anotherQuiteLongColumnName" varchar(255) not null;`;
        const file = await generator.generateMigrationFile("Migration20261029000000", {
            up: [longStatement, 'create table "User" ("id" uuid not null);'],
            down: [],
        });

        expect(file).toBe(
            [
                'import { Migration } from "@mikro-orm/migrations";',
                "",
                "export class Migration20261029000000 extends Migration {",
                '    override name = "Migration20261029000000";',
                "",
                "    override up(): void | Promise<void> {",
                "        this.addSql(",
                `            \`${longStatement}\`,`,
                "        );",
                '        this.addSql(`create table "User" ("id" uuid not null);`);',
                "    }",
                "}",
                "",
            ].join("\n"),
        );
    });
});
