import eslintConfigNestJs from "@dextinity/eslint-config/nestjs.js";
import { defineConfig, globalIgnores } from "eslint/config";

const config = defineConfig([
    globalIgnores(["src/db/migrations/**", "dist/**", "schema.gql", "package-lock.json"]),
    ...eslintConfigNestJs,
    {
        // The migration generator loads Prettier only while generating a migration in development, never in production
        files: ["src/db/migration-generator.ts"],
        rules: {
            "import/no-extraneous-dependencies": ["error", { devDependencies: true }],
        },
    },
]);

export default config;
