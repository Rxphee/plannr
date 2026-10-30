import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

// A token reads plannr_<lookup ID>_<secret>. The prefix lets people and secret scanners recognize a leaked token,
// the lookup ID finds its row without the secret ever being stored.
export const API_TOKEN_PREFIX = "plannr_";
const API_TOKEN_PATTERN = /^plannr_([0-9a-f]{16})_([\w-]{43})$/;
const LOOKUP_ID_BYTES = 8;
const SECRET_BYTES = 32;

interface GeneratedApiToken {
    token: string;
    lookupId: string;
    secretHash: string;
}

export function generateApiToken(): GeneratedApiToken {
    const lookupId = randomBytes(LOOKUP_ID_BYTES).toString("hex");
    const secret = randomBytes(SECRET_BYTES).toString("base64url");
    return { token: `${API_TOKEN_PREFIX}${lookupId}_${secret}`, lookupId, secretHash: hashSecret(secret) };
}

export function isApiToken(token: string): boolean {
    return token.startsWith(API_TOKEN_PREFIX);
}

export function parseApiToken(token: string): { lookupId: string; secret: string } | undefined {
    const match = API_TOKEN_PATTERN.exec(token);
    return match ? { lookupId: match[1], secret: match[2] } : undefined;
}

// SHA-256 instead of a slow password hash: the secret is 256 random bits, which no one can guess, and a slow hash would delay every request
export function hashSecret(secret: string): string {
    return createHash("sha256").update(secret).digest("hex");
}

export function matchesSecretHash(secret: string, secretHash: string): boolean {
    return timingSafeEqual(Buffer.from(hashSecret(secret), "hex"), Buffer.from(secretHash, "hex"));
}
