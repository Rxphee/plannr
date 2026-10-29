import { defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        tsconfigPaths: true,
    },
    test: {
        passWithNoTests: true,
        reporters: ["default", "junit"],
        outputFile: { junit: "./junit.xml" },
    },
});
