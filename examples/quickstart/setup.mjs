// Sets up the Zitadel of the quick start: the project, the app of the web app and the secrets of the web app.
// Safe to run again, it only creates what is missing.
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const APPLICATION_ID = "plannr-web";
const SETUP_TOKEN_FILE = "/current-dir/setup.pat";
const WEB_ENV_FILE = "/current-dir/web.env";

const issuer = process.env.OIDC_ISSUER;
const projectId = process.env.OIDC_AUDIENCE;
const webUrl = process.env.WEB_URL;
const setupToken = readFileSync(SETUP_TOKEN_FILE, "utf8").trim();

await ensureProject();
await ensureWebEnv();
console.log(`Plannr is set up, open ${webUrl} and sign in with admin@plannr.localhost and the password Plannr-quickstart-1`);

async function ensureProject() {
    if (await find("zitadel.project.v2.ProjectService/GetProject", { projectId })) {
        return;
    }
    const { org } = await parse("management/v1/orgs/me", await send("management/v1/orgs/me"));
    await request("zitadel.project.v2.ProjectService/CreateProject", { organizationId: org.id, projectId, name: "Plannr" });
}

async function ensureWebEnv() {
    if (existsSync(WEB_ENV_FILE) && (await find("zitadel.application.v2.ApplicationService/GetApplication", { applicationId: APPLICATION_ID }))) {
        return;
    }
    const { oidcConfiguration } = await request("zitadel.application.v2.ApplicationService/CreateApplication", {
        projectId,
        applicationId: APPLICATION_ID,
        name: "Plannr",
        oidcConfiguration: {
            applicationType: "OIDC_APP_TYPE_WEB",
            authMethodType: "OIDC_AUTH_METHOD_TYPE_BASIC",
            responseTypes: ["OIDC_RESPONSE_TYPE_CODE"],
            grantTypes: ["OIDC_GRANT_TYPE_AUTHORIZATION_CODE", "OIDC_GRANT_TYPE_REFRESH_TOKEN"],
            redirectUris: [new URL("/auth/callback", webUrl).href],
            postLogoutRedirectUris: [new URL("/", webUrl).href],
            // The API validates the access tokens itself, which needs JWTs instead of opaque tokens
            accessTokenType: "OIDC_TOKEN_TYPE_JWT",
            // Allows redirect URIs with http
            developmentMode: true,
        },
    });
    const { clientId, clientSecret } = oidcConfiguration;
    writeFileSync(
        WEB_ENV_FILE,
        `OIDC_CLIENT_ID=${clientId}\nOIDC_CLIENT_SECRET=${clientSecret}\nSESSION_SECRET=${randomBytes(48).toString("base64")}\n`,
        {
            mode: 0o600,
        },
    );
}

async function find(path, body) {
    const response = await send(path, body);
    return response.status === 404 ? undefined : parse(path, response);
}

async function request(path, body) {
    return parse(path, await send(path, body));
}

function send(path, body) {
    return fetch(new URL(`/${path}`, issuer), {
        method: body ? "POST" : "GET",
        headers: { Authorization: `Bearer ${setupToken}`, "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
    });
}

async function parse(path, response) {
    if (!response.ok) {
        throw new Error(`Zitadel refused ${path} with ${response.status}: ${await response.text()}`);
    }
    return response.json();
}
