import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";

import { EnvironmentVariables } from "./environment-variables.js";

export function createConfig(processEnv: NodeJS.ProcessEnv) {
    const envVars = plainToInstance(EnvironmentVariables, { ...processEnv });
    const errors = validateSync(envVars, { skipMissingProperties: false });
    if (errors.length > 0) {
        throw new Error(errors.toString());
    }
    return {
        debug: envVars.NODE_ENV !== "production",
        serverHost: envVars.SERVER_HOST ?? "localhost",
        apiPort: envVars.API_PORT,
        corsAllowedOrigin: new RegExp(envVars.CORS_ALLOWED_ORIGIN),
        oidc: {
            issuer: envVars.OIDC_ISSUER,
            audience: envVars.OIDC_AUDIENCE,
        },
        superAdminEmails: envVars.SUPER_ADMIN_EMAILS ?? [],
    };
}

export type Config = ReturnType<typeof createConfig>;
