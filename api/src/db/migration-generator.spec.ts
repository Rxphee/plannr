import type { NamingStrategy } from "@mikro-orm/core";
import type { AbstractSqlDriver } from "@mikro-orm/postgresql";
import { describe, expect, it } from "vitest";

import { MigrationGenerator } from "./migration-generator.js";

describe("MigrationGenerator", () => {
    it("generates up() only", () => {
        const generator = new MigrationGenerator({} as AbstractSqlDriver, {} as NamingStrategy, {});
        const file = generator.generateMigrationFile("Migration20261029000000", {
            up: ['create table "User" ("id" uuid not null);'],
            down: ['drop table "User";'],
        });

        expect(file).toContain('this.addSql(`create table "User" ("id" uuid not null);`);');
        expect(file).not.toContain("down()");
        expect(file).not.toContain("drop table");
    });
});
