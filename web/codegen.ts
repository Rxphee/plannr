import { type CodegenConfig } from "@graphql-codegen/cli";

const pluginConfig = {
    avoidOptionals: {
        field: true,
    },
    enumsAsTypes: true,
    namingConvention: "keep",
    scalars: {
        DateTime: "string",
        LocalDate: "string",
        ID: "string",
    },
    typesPrefix: "GQL",
};

const config: CodegenConfig = {
    schema: "schema.gql",
    generates: {
        "./src/graphql.generated.ts": {
            plugins: ["typescript"],
            config: pluginConfig,
        },
        "./src/": {
            documents: "./src/**/!(*.generated).{ts,tsx}",
            preset: "near-operation-file",
            presetConfig: {
                extension: ".generated.ts",
                baseTypesPath: "graphql.generated.ts",
            },
            plugins: ["named-operations-object", "typescript-operations"],
            config: pluginConfig,
        },
    },
    ignoreNoDocuments: true,
};

export default config;
