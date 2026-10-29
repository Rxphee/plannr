import eslintConfigNestJs from "@dextinity/eslint-config/nestjs.js";
import { defineConfig, globalIgnores } from "eslint/config";

const config = defineConfig([globalIgnores(["src/db/migrations/**", "dist/**", "schema.gql", "package-lock.json"]), ...eslintConfigNestJs]);

export default config;
