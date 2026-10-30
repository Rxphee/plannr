import { appUrl, callbackUrl, getOidcConfiguration, sessionFromTokens } from "@src/auth/oidc";
import { parseReturnTo } from "@src/auth/returnTo";
import { unseal } from "@src/auth/sealedCookie";
import { sealSession, writeSessionCookies } from "@src/auth/session";
import { requireSecret } from "@src/util/requireEnv";
import { type NextRequest, NextResponse } from "next/server";
import { authorizationCodeGrant } from "openid-client";

import { LOGIN_COOKIE } from "../loginCookie";

// The identity provider redirects here with the authorization code, which is exchanged for the tokens of the session
export async function GET(request: NextRequest) {
    const login = await unseal(request.cookies.get(LOGIN_COOKIE)?.value, { secret: requireSecret("SESSION_SECRET") });
    if (typeof login?.codeVerifier !== "string" || typeof login.state !== "string") {
        // e.g. the login took longer than the cookie lives, so it starts again
        return NextResponse.redirect(appUrl("/auth/login"));
    }

    let session;
    try {
        const tokens = await authorizationCodeGrant(await getOidcConfiguration(), new URL(`${callbackUrl().href}${request.nextUrl.search}`), {
            pkceCodeVerifier: login.codeVerifier,
            expectedState: login.state,
        });
        session = sessionFromTokens(tokens);
    } catch (error) {
        console.error("The login failed", error);
        return new NextResponse("The login failed. Please try again.", { status: 400 });
    }

    const response = NextResponse.redirect(appUrl(parseReturnTo(typeof login.returnTo === "string" ? login.returnTo : undefined)));
    writeSessionCookies(response.cookies, request.cookies, await sealSession(session));
    response.cookies.delete({ name: LOGIN_COOKIE, path: "/auth" });
    return response;
}
