import { EncryptJWT, jwtDecrypt, type JWTPayload } from "jose";

const MIN_SECRET_LENGTH = 32;

// The cookie values are encrypted (and thereby signed) with a key derived from SESSION_SECRET: the browser can neither read nor change them
async function encryptionKey(secret: string): Promise<Uint8Array> {
    if (secret.length < MIN_SECRET_LENGTH) {
        throw new Error(`SESSION_SECRET needs at least ${MIN_SECRET_LENGTH} characters`);
    }
    return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(secret)));
}

export async function seal(payload: JWTPayload, { secret, maxAge }: { secret: string; maxAge: number }): Promise<string> {
    return new EncryptJWT(payload)
        .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
        .setIssuedAt()
        .setExpirationTime(`${maxAge}s`)
        .encrypt(await encryptionKey(secret));
}

// Undefined for a missing, expired or tampered value
export async function unseal(value: string | undefined, { secret }: { secret: string }): Promise<JWTPayload | undefined> {
    if (!value) {
        return undefined;
    }
    try {
        const { payload } = await jwtDecrypt(value, await encryptionKey(secret));
        return payload;
    } catch {
        return undefined;
    }
}
