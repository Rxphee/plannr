import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import { readSessionCookies, unsealSession } from "./session";

// The session of the current request. The proxy has already refreshed it if needed.
export const getSession = cache(async () => unsealSession(readSessionCookies(await cookies())));
