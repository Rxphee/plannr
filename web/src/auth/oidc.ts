import { requireEnv, requireSecret } from "@src/util/requireEnv";
import {
    allowInsecureRequests,
    ClientSecretBasic,
    type Configuration,
    discovery,
    refreshTokenGrant,
    type TokenEndpointResponse,
    type TokenEndpointResponseHelpers,
} from "openid-client";

import type { Session } from "./session";

// offline_access asks for a refresh token, so the session outlives the short-lived access token
export const OIDC_SCOPE = "openid profile email offline_access";
// Used when the identity provider does not say how long its access token lives
const DEFAULT_ACCESS_TOKEN_LIFETIME = 300;
// Many identity providers accept each refresh token only once, so parallel requests must not refresh it each on their own
const REFRESH_REUSE_TIME = 60 * 1000;

let configuration: Promise<Configuration> | undefined;
const refreshes = new Map<string, Promise<Session | undefined>>();

// Discovered on first use and kept, a failed discovery is tried again on the next request
export function getOidcConfiguration(): Promise<Configuration> {
    configuration ??= discoverConfiguration().catch((error: unknown) => {
        configuration = undefined;
        throw error;
    });
    return configuration;
}

async function discoverConfiguration(): Promise<Configuration> {
    const issuer = new URL(requireEnv("OIDC_ISSUER"));
    const isLocalDevelopment = issuer.protocol === "http:" && process.env.NODE_ENV !== "production";
    return discovery(issuer, requireEnv("OIDC_CLIENT_ID"), undefined, ClientSecretBasic(requireSecret("OIDC_CLIENT_SECRET")), {
        // The local identity provider runs without TLS
        execute: isLocalDevelopment ? [allowInsecureRequests] : [],
    });
}

// Built from WEB_URL instead of the request, which behind a reverse proxy may carry an internal host
export function appUrl(path: string): URL {
    return new URL(path, requireEnv("WEB_URL"));
}

export const callbackUrl = () => appUrl("/auth/callback");

export function sessionFromTokens(tokens: TokenEndpointResponse & TokenEndpointResponseHelpers, previous?: Session): Session {
    return {
        accessToken: tokens.access_token,
        expiresAt: Math.floor(Date.now() / 1000) + (tokens.expiresIn() ?? DEFAULT_ACCESS_TOKEN_LIFETIME),
        // A refresh may come without a new refresh or ID token, then the old ones stay valid
        refreshToken: tokens.refresh_token ?? previous?.refreshToken,
        idToken: tokens.id_token ?? previous?.idToken,
    };
}

// Undefined if the session cannot be refreshed, e.g. because the user logged out at the identity provider
export function refreshSession(session: Session): Promise<Session | undefined> {
    const { refreshToken } = session;
    if (!refreshToken) {
        return Promise.resolve(undefined);
    }

    let refresh = refreshes.get(refreshToken);
    if (!refresh) {
        refresh = requestRefresh(refreshToken, session);
        refreshes.set(refreshToken, refresh);
        // Requests that still carry the old cookie get the same new tokens
        setTimeout(() => refreshes.delete(refreshToken), REFRESH_REUSE_TIME);
    }
    return refresh;
}

async function requestRefresh(refreshToken: string, session: Session): Promise<Session | undefined> {
    try {
        return sessionFromTokens(await refreshTokenGrant(await getOidcConfiguration(), refreshToken), session);
    } catch (error) {
        console.warn("The session could not be refreshed", error);
        return undefined;
    }
}
