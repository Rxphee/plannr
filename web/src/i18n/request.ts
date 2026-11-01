import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";

import { formats } from "./formats";
import { LOCALE_COOKIE_NAME, negotiateLocale, parseLocalePreference } from "./locales";

// Loaded by the next-intl plugin for every request; the app has no locale in its URLs
export default getRequestConfig(async () => {
    const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
    const preference = parseLocalePreference(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
    const locale = preference === "system" ? negotiateLocale(requestHeaders.get("accept-language")) : preference;

    return {
        locale,
        messages: (await import(`../../messages/${locale}.json`)).default,
        formats,
    };
});
