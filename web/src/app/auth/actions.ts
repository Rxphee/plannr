"use server";

import { appUrl, getOidcConfiguration } from "@src/auth/oidc";
import { readSessionCookies, unsealSession, writeSessionCookies } from "@src/auth/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { buildEndSessionUrl, tokenRevocation } from "openid-client";

// Ends the session in Plannr and at the identity provider, which then sends the user back to the start page
export async function signOut(): Promise<void> {
    const cookieStore = await cookies();
    const session = await unsealSession(readSessionCookies(cookieStore));
    writeSessionCookies(cookieStore, cookieStore);

    const configuration = await getOidcConfiguration();
    const { revocation_endpoint: revocationEndpoint, end_session_endpoint: endSessionEndpoint } = configuration.serverMetadata();
    if (session?.refreshToken && revocationEndpoint) {
        await tokenRevocation(configuration, session.refreshToken).catch((error: unknown) =>
            console.warn("The refresh token could not be revoked", error),
        );
    }

    if (!endSessionEndpoint) {
        redirect("/");
    }
    const parameters: Record<string, string> = { post_logout_redirect_uri: appUrl("/").href };
    if (session?.idToken) {
        parameters.id_token_hint = session.idToken;
    }
    redirect(buildEndSessionUrl(configuration, parameters).href);
}
