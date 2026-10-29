import { EntityCaseNamingStrategy, TextType, Type } from "@mikro-orm/core";
import { Migrator } from "@mikro-orm/migrations";
import { defineConfig } from "@mikro-orm/postgresql";

export const ormConfig = defineConfig({
    host: process.env.POSTGRESQL_HOST,
    port: Number(process.env.POSTGRESQL_PORT),
    user: process.env.POSTGRESQL_USER,
    password: process.env.POSTGRESQL_PASSWORD,
    dbName: process.env.POSTGRESQL_DB,
    namingStrategy: EntityCaseNamingStrategy,
    entities: ["./dist/**/*.entity.js"],
    entitiesTs: ["./src/**/*.entity.ts"],
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
        path: "./dist/db/migrations",
        pathTs: "./src/db/migrations",
        disableForeignKeys: false,
        dropTables: false,
        snapshot: false,
    },
});
