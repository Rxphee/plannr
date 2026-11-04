// Sets up the local Zitadel for development: the project, the app of the web app, the development users
// and the rights of the development login (dev/zitadel/login.mts).
// Safe to run again, it only creates what is missing. Zitadel generates the client ID and secret,
// so they are written to .env.zitadel, which the web app reads next to .env.
import { existsSync, readFileSync, writeFileSync } from "node:fs";

import { developmentUsers } from "../../api/src/db/fixtures/development-users.ts";

const DEVELOPMENT_PASSWORD = "plannr";
const APPLICATION_ID = "plannr-web";
const GRANT_TYPES = ["OIDC_GRANT_TYPE_AUTHORIZATION_CODE", "OIDC_GRANT_TYPE_REFRESH_TOKEN"];
const SETUP_TOKEN_FILE = new URL("runtime/setup.pat", import.meta.url);
const CREDENTIALS_FILE = new URL("../../.env.zitadel", import.meta.url);
// The first start creates the database and the instance, which takes a while
const READY_TIMEOUT = 3 * 60 * 1000;

interface ClientCredentials {
    clientId: string;
    clientSecret: string;
}

interface HumanUser {
    user: {
        username: string;
        human: { profile: { givenName: string; familyName: string }; email: { email: string } };
    };
}

interface OidcConfiguration {
    clientId: string;
    grantTypes?: string[];
    redirectUris?: string[];
    postLogoutRedirectUris?: string[];
    loginVersion?: { loginV2?: { baseUri?: string } };
}

const issuer = requireEnv("OIDC_ISSUER");
// The audience of Zitadel's access tokens is the ID of the project
const projectId = requireEnv("OIDC_AUDIENCE");
const webUrl = requireEnv("WEB_URL");
const loginVersion = { loginV2: { baseUri: requireEnv("OIDC_LOGIN_URL") } };
const redirectUris = [new URL("/auth/callback", webUrl).href];
const postLogoutRedirectUris = [new URL("/", webUrl).href];

await waitUntilReady();
const setupToken = readSetupToken();
await allowDevelopmentLogin();
await ensureProject();
const credentials = await ensureApplication();
await ensureDevelopmentUsers();
writeCredentials(credentials);
console.log("The local Zitadel is set up");

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} is not set`);
    }
    return value;
}

async function waitUntilReady(): Promise<void> {
    const deadline = Date.now() + READY_TIMEOUT;
    while (!(await isReady())) {
        if (Date.now() > deadline) {
            throw new Error(`Zitadel at ${issuer} did not get ready, see the logs of the oidc-provider service`);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
    }
}

// The gateway of the v1 API may refuse requests for a moment after Zitadel reports ready
async function isReady(): Promise<boolean> {
    for (const path of ["/debug/ready", "/management/v1/healthz"]) {
        try {
            const response = await fetch(new URL(path, issuer));
            if (!response.ok) {
                return false;
            }
        } catch {
            return false;
        }
    }
    return true;
}

function readSetupToken(): string {
    if (!existsSync(SETUP_TOKEN_FILE)) {
        throw new Error(
            "dev/zitadel/runtime/setup.pat is missing. Zitadel writes it only when it creates its database, see AGENTS.md on how to start the local Zitadel afresh.",
        );
    }
    return readFileSync(SETUP_TOKEN_FILE, "utf8").trim();
}

// A login page needs IAM_LOGIN_CLIENT to finish a login with a session it created. The call changes nothing if the role is already there.
async function allowDevelopmentLogin(): Promise<void> {
    const { user } = await request<{ user: { id: string } }>("auth/v1/users/me");
    await request("zitadel.internal_permission.v2.InternalPermissionService/UpdateAdministrator", {
        userId: user.id,
        resource: { instance: true },
        roles: ["IAM_OWNER", "IAM_LOGIN_CLIENT"],
    });
}

async function ensureProject(): Promise<void> {
    if (await find("zitadel.project.v2.ProjectService/GetProject", { projectId })) {
        return;
    }
    const { org } = await request<{ org: { id: string } }>("management/v1/orgs/me");
    await request("zitadel.project.v2.ProjectService/CreateProject", { organizationId: org.id, projectId, name: "Plannr" });
    console.log(`Created the project ${projectId}`);
}

async function ensureApplication(): Promise<ClientCredentials> {
    const existing = await find<{ application: { oidcConfiguration: OidcConfiguration } }>(
        "zitadel.application.v2.ApplicationService/GetApplication",
        {
            applicationId: APPLICATION_ID,
        },
    );
    if (!existing) {
        return createApplication();
    }

    const configuration = existing.application.oidcConfiguration;
    if (
        !haveSameItems(configuration.redirectUris, redirectUris) ||
        !haveSameItems(configuration.postLogoutRedirectUris, postLogoutRedirectUris) ||
        !haveSameItems(configuration.grantTypes, GRANT_TYPES) ||
        configuration.loginVersion?.loginV2?.baseUri !== loginVersion.loginV2.baseUri
    ) {
        await request("zitadel.application.v2.ApplicationService/UpdateApplication", {
            applicationId: APPLICATION_ID,
            projectId,
            // Zitadel resets the grant types of an update that leaves them out
            oidcConfiguration: { redirectUris, postLogoutRedirectUris, loginVersion, grantTypes: GRANT_TYPES },
        });
        console.log(`Updated the URLs of the app ${APPLICATION_ID} for ${webUrl}`);
    }

    const written = readCredentials();
    if (written?.clientId === configuration.clientId) {
        return written;
    }
    // The secret cannot be read back, so a lost one is replaced
    const { clientSecret } = await request<{ clientSecret: string }>("zitadel.application.v2.ApplicationService/GenerateClientSecret", {
        applicationId: APPLICATION_ID,
        projectId,
    });
    console.log(`Generated a new client secret for the app ${APPLICATION_ID}`);
    return { clientId: configuration.clientId, clientSecret };
}

async function createApplication(): Promise<ClientCredentials> {
    const { oidcConfiguration } = await request<{ oidcConfiguration: ClientCredentials }>(
        "zitadel.application.v2.ApplicationService/CreateApplication",
        {
            projectId,
            applicationId: APPLICATION_ID,
            name: "Plannr",
            oidcConfiguration: {
                applicationType: "OIDC_APP_TYPE_WEB",
                authMethodType: "OIDC_AUTH_METHOD_TYPE_BASIC",
                responseTypes: ["OIDC_RESPONSE_TYPE_CODE"],
                grantTypes: GRANT_TYPES,
                redirectUris,
                postLogoutRedirectUris,
                loginVersion,
                // The API validates the access tokens itself, which needs JWTs instead of opaque tokens
                accessTokenType: "OIDC_TOKEN_TYPE_JWT",
                // Allows redirect URIs with http
                developmentMode: true,
            },
        },
    );
    console.log(`Created the app ${APPLICATION_ID}`);
    return oidcConfiguration;
}

async function ensureDevelopmentUsers(): Promise<void> {
    for (const [username, user] of Object.entries(developmentUsers)) {
        const profile = { givenName: user.firstName, familyName: user.lastName };
        const email = { email: user.email, isVerified: user.isEmailVerified };
        const existing = await find<HumanUser>("zitadel.user.v2.UserService/GetUserByID", { userId: user.oidcSubject });
        if (existing) {
            const { username: existingUsername, human } = existing.user;
            const isUpToDate =
                existingUsername === username &&
                human.profile.givenName === profile.givenName &&
                human.profile.familyName === profile.familyName &&
                human.email.email === email.email;
            if (!isUpToDate) {
                await request("zitadel.user.v2.UserService/UpdateHumanUser", { userId: user.oidcSubject, username, profile, email });
                console.log(`Updated the user ${username}`);
            }
            continue;
        }
        await request("zitadel.user.v2.UserService/AddHumanUser", {
            // A fixed ID, so the fixtures know the sub claim of each user
            userId: user.oidcSubject,
            username,
            profile,
            email,
            password: { password: DEVELOPMENT_PASSWORD, changeRequired: false },
        });
        console.log(`Created the user ${username}`);
    }
}

function readCredentials(): ClientCredentials | undefined {
    if (!existsSync(CREDENTIALS_FILE)) {
        return undefined;
    }
    const content = readFileSync(CREDENTIALS_FILE, "utf8");
    const clientId = /^OIDC_CLIENT_ID=(.+)$/m.exec(content)?.[1];
    const clientSecret = /^OIDC_CLIENT_SECRET=(.+)$/m.exec(content)?.[1];
    return clientId && clientSecret ? { clientId, clientSecret } : undefined;
}

function writeCredentials({ clientId, clientSecret }: ClientCredentials): void {
    const written = readCredentials();
    if (written?.clientId === clientId && written.clientSecret === clientSecret) {
        return;
    }
    writeFileSync(
        CREDENTIALS_FILE,
        `# Written by dev/zitadel/setup.mts for the local Zitadel\nOIDC_CLIENT_ID=${clientId}\nOIDC_CLIENT_SECRET=${clientSecret}\n`,
    );
    console.log("Wrote the client credentials to .env.zitadel");
}

function haveSameItems(actual: string[] = [], expected: string[]): boolean {
    return actual.length === expected.length && expected.every((item) => actual.includes(item));
}

// Undefined if Zitadel does not know the requested object
async function find<T>(path: string, body: object): Promise<T | undefined> {
    const response = await send(path, body);
    if (response.status === 404) {
        return undefined;
    }
    return parse<T>(path, response);
}

async function request<T>(path: string, body?: object): Promise<T> {
    return parse<T>(path, await send(path, body));
}

// The v2 services take a POST with JSON (Connect protocol), the v1 API a GET for reading
function send(path: string, body?: object): Promise<Response> {
    return fetch(new URL(`/${path}`, issuer), {
        method: body ? "POST" : "GET",
        headers: { Authorization: `Bearer ${setupToken}`, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });
}

async function parse<T>(path: string, response: Response): Promise<T> {
    if (!response.ok) {
        throw new Error(`Zitadel refused ${path} with ${response.status}: ${await response.text()}`);
    }
    return (await response.json()) as T;
}
