import { appUrl, refreshSession } from "@src/auth/oidc";
import {
    needsRefresh,
    readSessionCookies,
    sealSession,
    splitSessionCookies,
    staleSessionCookieNames,
    unsealSession,
    writeSessionCookies,
} from "@src/auth/session";
import { type NextRequest, NextResponse } from "next/server";

// Sends users without a session to the login and refreshes the access token before it expires.
// Only the proxy can do the latter, as Server Components cannot set cookies.
export async function proxy(request: NextRequest) {
    const session = await unsealSession(readSessionCookies(request.cookies));
    if (!session) {
        return redirectToLogin(request);
    }
    if (!needsRefresh(session)) {
        return NextResponse.next();
    }

    const refreshedSession = await refreshSession(session);
    if (!refreshedSession) {
        const response = redirectToLogin(request);
        writeSessionCookies(response.cookies, request.cookies);
        return response;
    }

    const sealedSession = await sealSession(refreshedSession);
    // The pages of this request read the new tokens from the request, the browser keeps them from the response
    const previousCookies = request.cookies.getAll();
    for (const { name, value } of splitSessionCookies(sealedSession)) {
        request.cookies.set(name, value);
    }
    request.cookies.delete(staleSessionCookieNames(request.cookies, sealedSession));
    const response = NextResponse.next({ request: { headers: request.headers } });
    writeSessionCookies(response.cookies, { getAll: () => previousCookies }, sealedSession);
    return response;
}

function redirectToLogin(request: NextRequest): NextResponse {
    const loginUrl = appUrl("/auth/login");
    loginUrl.searchParams.set("returnTo", `${request.nextUrl.pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(loginUrl);
}

export const config = {
    // Everything but the login itself and the files of Next.js
    matcher: ["/((?!auth/|_next/|__nextjs|favicon.ico).*)"],
};
