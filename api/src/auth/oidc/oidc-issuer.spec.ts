import { exportJWK, generateKeyPair, type JWK, type JWTPayload, SignJWT } from "jose";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { OidcIssuer } from "./oidc-issuer.js";

const issuer = "https://id.example.com";
const audience = "plannr-api";

let signingKey: CryptoKey;
let otherKey: CryptoKey;
let jwks: { keys: JWK[] };

beforeAll(async () => {
    const keyPair = await generateKeyPair("RS256");
    signingKey = keyPair.privateKey;
    otherKey = (await generateKeyPair("RS256")).privateKey;
    jwks = { keys: [{ ...(await exportJWK(keyPair.publicKey)), kid: "key-1", alg: "RS256", use: "sig" }] };
});

function createToken(payload: JWTPayload = {}, { key = signingKey, expiresIn = "5m" }: { key?: CryptoKey; expiresIn?: string } = {}) {
    return new SignJWT({ sub: "user-1", iss: issuer, aud: audience, ...payload })
        .setProtectedHeader({ alg: "RS256", kid: "key-1" })
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .sign(key);
}

function stubIdentityProvider(discovery: Record<string, unknown> = {}) {
    const fetchMock = vi.fn(async (input: string | URL | Request) => {
        const url = input instanceof Request ? input.url : input.toString();
        switch (url) {
            case `${issuer}/.well-known/openid-configuration`:
                return Response.json({ issuer, jwks_uri: `${issuer}/keys`, userinfo_endpoint: `${issuer}/userinfo`, ...discovery });
            case `${issuer}/keys`:
                return Response.json(jwks);
            case `${issuer}/userinfo`:
                return Response.json({ sub: "user-1", email: "erika@example.com" });
            default:
                return new Response(null, { status: 404 });
        }
    });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

describe("OidcIssuer", () => {
    let oidcIssuer: OidcIssuer;

    beforeEach(() => {
        oidcIssuer = new OidcIssuer({ issuer, audience });
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("accepts a token of the issuer for the audience", async () => {
        stubIdentityProvider();
        await expect(oidcIssuer.verifyAccessToken(await createToken())).resolves.toMatchObject({ sub: "user-1", iss: issuer });
    });

    it("rejects a token of another issuer", async () => {
        stubIdentityProvider();
        const token = await createToken({ iss: "https://evil.example.com" });
        await expect(oidcIssuer.verifyAccessToken(token)).rejects.toThrow(/iss/);
    });

    it("rejects a token for another audience", async () => {
        stubIdentityProvider();
        const token = await createToken({ aud: "another-api" });
        await expect(oidcIssuer.verifyAccessToken(token)).rejects.toThrow(/aud/);
    });

    it("rejects an expired token", async () => {
        stubIdentityProvider();
        const token = await createToken({}, { expiresIn: "-1m" });
        await expect(oidcIssuer.verifyAccessToken(token)).rejects.toThrow(/exp/);
    });

    it("rejects a token signed with another key", async () => {
        stubIdentityProvider();
        const token = await createToken({}, { key: otherKey });
        await expect(oidcIssuer.verifyAccessToken(token)).rejects.toThrow(/signature/);
    });

    it("rejects an unsigned token", async () => {
        stubIdentityProvider();
        const [, payload] = (await createToken()).split(".");
        const header = Buffer.from(JSON.stringify({ alg: "none" })).toString("base64url");
        await expect(oidcIssuer.verifyAccessToken(`${header}.${payload}.`)).rejects.toThrow();
    });

    it("rejects a token without subject", async () => {
        stubIdentityProvider();
        const token = await createToken({ sub: undefined });
        await expect(oidcIssuer.verifyAccessToken(token)).rejects.toThrow(/subject/);
    });

    it("refuses an identity provider that calls itself differently", async () => {
        stubIdentityProvider({ issuer: "https://other.example.com" });
        await expect(oidcIssuer.verifyAccessToken(await createToken())).rejects.toThrow(/calls itself/);
    });

    it("discovers the identity provider only once", async () => {
        const fetchMock = stubIdentityProvider();
        await oidcIssuer.verifyAccessToken(await createToken());
        await oidcIssuer.fetchUserInfo(await createToken());

        const discoveryRequests = fetchMock.mock.calls.filter(([url]) => url.toString().endsWith("/.well-known/openid-configuration"));
        expect(discoveryRequests).toHaveLength(1);
    });

    it("sends the access token to the userinfo endpoint", async () => {
        const fetchMock = stubIdentityProvider();
        const token = await createToken();

        await expect(oidcIssuer.fetchUserInfo(token)).resolves.toEqual({ sub: "user-1", email: "erika@example.com" });
        expect(fetchMock).toHaveBeenCalledWith(
            `${issuer}/userinfo`,
            expect.objectContaining({ headers: expect.objectContaining({ authorization: `Bearer ${token}` }) }),
        );
    });
});
