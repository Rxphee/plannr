import { type ClassConstructor, plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";

import { EnvironmentVariables } from "./environment-variables.js";
import { StorageEnvironmentVariables } from "./storage-environment-variables.js";

export function createConfig(processEnv: NodeJS.ProcessEnv) {
    const envVars = validateEnvironment(EnvironmentVariables, processEnv);
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
        storage: createStorageConfig(processEnv),
    };
}

export type Config = ReturnType<typeof createConfig>;

export type StorageConfig = NonNullable<Config["storage"]>;

// The S3 storage is optional: without S3_ENDPOINT the instance has no image uploads, with it every other S3 variable is required
function createStorageConfig(processEnv: NodeJS.ProcessEnv) {
    if (!processEnv.S3_ENDPOINT) {
        return null;
    }
    const envVars = validateEnvironment(StorageEnvironmentVariables, processEnv);
    return {
        endpoint: envVars.S3_ENDPOINT,
        region: envVars.S3_REGION,
        bucket: envVars.S3_BUCKET,
        accessKeyId: envVars.S3_ACCESS_KEY_ID,
        secretAccessKey: envVars.S3_SECRET_ACCESS_KEY,
        forcePathStyle: envVars.S3_FORCE_PATH_STYLE ?? false,
    };
}

function validateEnvironment<T extends object>(variables: ClassConstructor<T>, processEnv: NodeJS.ProcessEnv): T {
    const envVars = plainToInstance(variables, { ...processEnv });
    const errors = validateSync(envVars, { skipMissingProperties: false });
    if (errors.length > 0) {
        throw new Error(errors.toString());
    }
    return envVars;
}
