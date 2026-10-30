// The values of these secrets in .env are public, so production must set its own
export const developmentSecrets = {
    OIDC_CLIENT_SECRET: "plannr-development-secret",
    SESSION_SECRET: "plannr-development-session-secret-of-32-characters",
};

export function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} is not set`);
    }
    return value;
}

// Refuses the development value in production, so a forgotten override cannot run with a publicly known key
export function requireSecret(name: keyof typeof developmentSecrets): string {
    const value = requireEnv(name);
    if (process.env.NODE_ENV === "production" && value === developmentSecrets[name]) {
        throw new Error(`${name} still has the development value from .env, set a secret of your own`);
    }
    return value;
}
