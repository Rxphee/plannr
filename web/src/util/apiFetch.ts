import "server-only";

import { getSession } from "@src/auth/getSession";
import { redirect } from "next/navigation";

// Server-side request against the API (path below API_URL, e.g. "/graphql") with the access token of the session
export async function apiFetch(
    path: string,
    { method = "GET", headers = {}, body }: { method?: string; headers?: Record<string, string>; body?: BodyInit } = {},
) {
    const apiUrl = process.env.API_URL;
    if (!apiUrl) {
        throw new Error("API_URL is not set");
    }

    // The proxy sends every request without a session to the login, so this only happens if the cookie vanished in between
    const session = await getSession();
    if (!session) {
        redirect("/auth/login");
    }

    return fetch(`${apiUrl}${path}`, {
        method,
        headers: { ...headers, authorization: `Bearer ${session.accessToken}` },
        body,
        cache: "no-store",
    });
}
