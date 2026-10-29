import { ApolloDriver, type ApolloDriverConfig } from "@nestjs/apollo";
import { type DynamicModule, Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { GraphQLError } from "graphql";

import { AuthModule } from "./auth/auth.module.js";
import type { Config } from "./config/config.js";
import { DbModule } from "./db/db.module.js";
import { HealthcheckModule } from "./healthcheck/healthcheck.module.js";
import { ProjectsModule } from "./projects/projects.module.js";

@Module({})
export class AppModule {
    static forRoot(config: Config): DynamicModule {
        return {
            module: AppModule,
            imports: [
                DbModule,
                AuthModule,
                GraphQLModule.forRoot<ApolloDriverConfig>({
                    driver: ApolloDriver,
                    // Serve GraphQL under /api/graphql like the REST routes
                    useGlobalPrefix: true,
                    graphiql: config.debug ? { url: "/api/graphql" } : undefined,
                    playground: false,
                    // Prevents writing the schema.gql file in production. Necessary for environments with a read-only file system
                    autoSchemaFile: process.env.NODE_ENV === "development" ? "schema.gql" : true,
                    sortSchema: true,
                    formatError: (error) => {
                        // Disable GraphQL field suggestions in production
                        if (!config.debug && error.extensions?.code === "GRAPHQL_VALIDATION_FAILED") {
                            return new GraphQLError("Invalid request.");
                        }
                        return error;
                    },
                }),
                HealthcheckModule,
                ProjectsModule,
            ],
        };
    }
}
