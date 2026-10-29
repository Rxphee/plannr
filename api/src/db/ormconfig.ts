import path from "node:path";

import { EntityCaseNamingStrategy, TextType, Type } from "@mikro-orm/core";
import { ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { Migrator } from "@mikro-orm/migrations";
import { defineConfig } from "@mikro-orm/postgresql";

import { MigrationGenerator } from "./migration-generator.js";

// Entities and migrations are found next to this file, so the same config works from src (console, CLI) and from dist (production)
const srcOrDistDirectory = path.resolve(import.meta.dirname, "..");

export const ormConfig = defineConfig({
    host: process.env.POSTGRESQL_HOST,
    port: Number(process.env.POSTGRESQL_PORT),
    user: process.env.POSTGRESQL_USER,
    password: process.env.POSTGRESQL_PASSWORD,
    dbName: process.env.POSTGRESQL_DB,
    namingStrategy: EntityCaseNamingStrategy,
    entities: [path.join(srcOrDistDirectory, "**/*.entity.{js,ts}")],
    metadataProvider: ReflectMetadataProvider,
    discovery: {
        // Remove once the first entity exists
        warnWhenNoEntities: false,
        getMappedType(type: string, platform) {
            // Map all string types to TEXT instead of VARCHAR
            if (type === "string") {
                return Type.getType(TextType);
            }
            return platform.getDefaultMappedType(type);
        },
    },
    extensions: [Migrator],
    migrations: {
        tableName: "Migrations",
        generator: MigrationGenerator,
        path: path.join(srcOrDistDirectory, "db/migrations"),
        disableForeignKeys: false,
        dropTables: false,
        snapshot: false,
    },
});
