// The login page of the local Zitadel: choose a development user instead of typing a name and a password.
// Zitadel sends the browser here because dev/zitadel/setup.mts names this server as the login of the app.
// Development only, the Docker images do not contain it.
import { readFileSync } from "node:fs";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";

import { developmentUsers } from "../../api/src/db/fixtures/development-users.ts";

const SETUP_TOKEN_FILE = new URL("runtime/setup.pat", import.meta.url);
const AUTH_REQUEST_ID = /^V2_\d+$/;

const issuer = requireEnv("OIDC_ISSUER");
const webUrl = requireEnv("WEB_URL");
const loginUrl = new URL(requireEnv("OIDC_LOGIN_URL"));

createServer((request, response) => {
    handleRequest(request, response).catch((error: unknown) => {
        console.error(error);
        sendPage(response, 500, renderMessage(`The login failed, see the logs of the login script. <a href="${webUrl}">Try again</a>`));
    });
}).listen(Number(loginUrl.port), loginUrl.hostname, () => console.log(`The development login runs at ${loginUrl.href}`));

async function handleRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const url = new URL(request.url ?? "/", loginUrl);

    if (url.pathname !== "/login") {
        // No redirect to the web app: a request for the favicon would start a new login there and replace the cookie of the running one
        response.writeHead(404).end();
        return;
    }
    if (request.method === "POST") {
        const form = new URLSearchParams(await readBody(request));
        await logIn({ response, authRequestId: form.get("authRequest"), userId: form.get("user") });
        return;
    }
    const authRequestId = url.searchParams.get("authRequest");
    if (!isAuthRequestId(authRequestId)) {
        sendPage(response, 400, renderMessage(`This page only works as part of a login. <a href="${webUrl}">Go to Plannr</a>`));
        return;
    }
    sendPage(response, 200, renderForm(authRequestId));
}

async function logIn({ response, authRequestId, userId }: { response: ServerResponse; authRequestId: string | null; userId: string | null }) {
    if (!isAuthRequestId(authRequestId) || !Object.values(developmentUsers).some((user) => user.oidcSubject === userId)) {
        sendPage(response, 400, renderMessage(`Unknown user or login. <a href="${webUrl}">Try again</a>`));
        return;
    }
    const { sessionId, sessionToken } = await request<{ sessionId: string; sessionToken: string }>(
        "zitadel.session.v2.SessionService/CreateSession",
        {
            checks: { user: { userId } },
        },
    );
    const { callbackUrl } = await request<{ callbackUrl: string }>("zitadel.oidc.v2.OIDCService/CreateCallback", {
        authRequestId,
        session: { sessionId, sessionToken },
    });
    response.writeHead(303, { Location: callbackUrl }).end();
}

function isAuthRequestId(value: string | null): value is string {
    return value !== null && AUTH_REQUEST_ID.test(value);
}

function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} is not set`);
    }
    return value;
}

async function readBody(request: IncomingMessage): Promise<string> {
    let body = "";
    for await (const chunk of request) {
        body += String(chunk);
    }
    return body;
}

async function request<T>(path: string, body: object): Promise<T> {
    const response = await fetch(new URL(`/${path}`, issuer), {
        method: "POST",
        headers: { Authorization: `Bearer ${readFileSync(SETUP_TOKEN_FILE, "utf8").trim()}`, "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        throw new Error(`Zitadel refused ${path} with ${response.status}: ${await response.text()}`);
    }
    return (await response.json()) as T;
}

function sendPage(response: ServerResponse, status: number, content: string): void {
    response.writeHead(status, { "Content-Type": "text/html; charset=utf-8" }).end(renderPage(content));
}

function renderForm(authRequestId: string): string {
    const options = Object.values(developmentUsers)
        .map((user) => `<option value="${user.oidcSubject}">${user.firstName} ${user.lastName} (${user.email})</option>`)
        .join("");
    return `<form method="post" action="/login">
        <input type="hidden" name="authRequest" value="${authRequestId}" />
        <label for="user">User</label>
        <select id="user" name="user" autofocus>${options}</select>
        <button type="submit">Sign in</button>
    </form>`;
}

function renderMessage(message: string): string {
    return `<p>${message}</p>`;
}

function renderPage(content: string): string {
    return `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Sign in to Plannr</title>
    <style>
        :root {
            color-scheme: light dark;
            font-family: system-ui, sans-serif;
        }

        body {
            display: grid;
            place-items: center;
            min-height: 100dvh;
            margin: 0;
            padding: 16px;
            box-sizing: border-box;
        }

        main {
            width: 100%;
            max-width: 360px;
        }

        h1 {
            margin: 0;
            font-size: 24px;
        }

        form {
            display: grid;
            gap: 8px;
        }

        select,
        button {
            padding: 10px;
            border-radius: 8px;
            font: inherit;
        }

        button {
            margin-top: 8px;
            border: 0;
            background: #2563eb;
            color: #fff;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <main>
        <h1>Sign in to Plannr</h1>
        <p>Development login</p>
        ${content}
    </main>
</body>
</html>`;
}
