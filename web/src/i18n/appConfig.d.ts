import type messages from "@src/../messages/en.json";

import type { formats } from "./formats";
import type { Locale } from "./locales";

declare module "next-intl" {
    interface AppConfig {
        Locale: Locale;
        Messages: typeof messages;
        Formats: typeof formats;
    }
}
