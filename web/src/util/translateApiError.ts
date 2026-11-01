import "server-only";

import type { Messages } from "next-intl";
import { getFormatter, getTranslations } from "next-intl/server";

import type { GraphQLFetchError } from "./graphQLFetch";

type ApiErrorReason = keyof Messages["apiErrors"];

// The text of an input error in the language of the user; reasons the messages do not know keep the English message of the API
export async function translateApiError({ message, reason, params }: GraphQLFetchError): Promise<string> {
    const [t, format] = await Promise.all([getTranslations("apiErrors"), getFormatter()]);
    if (!reason || !t.has(reason as ApiErrorReason)) {
        return message;
    }
    // Lists like the names of several people read naturally in each language, e.g. "Max and Erika" or "Max und Erika"
    const values = Object.fromEntries(Object.entries(params).map(([name, value]) => [name, Array.isArray(value) ? format.list(value) : value]));
    return t(reason as ApiErrorReason, values);
}
