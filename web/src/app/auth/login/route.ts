import { appUrl, callbackUrl, getOidcConfiguration, OIDC_SCOPE } from "@src/auth/oidc";
import { parseReturnTo } from "@src/auth/returnTo";
import { seal } from "@src/auth/sealedCookie";
import { requireEnv } from "@src/util/requireEnv";
import { type NextRequest, NextResponse } from "next/server";
import { buildAuthorizationUrl, calculatePKCECodeChallenge, randomPKCECodeVerifier, randomState } from "openid-client";

import { LOGIN_COOKIE, LOGIN_MAX_AGE } from "../loginCookie";

// Starts the authorization code flow with PKCE at the identity provider
export async function GET(request: NextRequest) {
    const configuration = await getOidcConfiguration();
    const codeVerifier = randomPKCECodeVerifier();
    const state = randomState();
    const returnTo = parseReturnTo(request.nextUrl.searchParams.get("returnTo"));

    const authorizationUrl = buildAuthorizationUrl(configuration, {
        redirect_uri: callbackUrl().href,
        scope: OIDC_SCOPE,
        code_challenge: await calculatePKCECodeChallenge(codeVerifier),
        code_challenge_method: "S256",
        state,
    });

    const response = NextResponse.redirect(authorizationUrl);
    response.cookies.set(
        LOGIN_COOKIE,
        await seal({ codeVerifier, state, returnTo }, { secret: requireEnv("SESSION_SECRET"), maxAge: LOGIN_MAX_AGE }),
        {
            httpOnly: true,
            secure: appUrl("/").protocol === "https:",
            sameSite: "lax",
            path: "/auth",
            maxAge: LOGIN_MAX_AGE,
        },
    );
    return response;
}
