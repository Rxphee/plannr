import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
    resolve: {
        tsconfigPaths: true,
    },
    test: {
        // The dev server compiles spec files into dist, which must not run as tests
        exclude: [...configDefaults.exclude, "dist/**"],
        reporters: ["default", "junit"],
        outputFile: { junit: "./junit.xml" },
    },
});
