import { createRemoteJWKSet, type JWTPayload, jwtVerify } from "jose";

export interface OidcIssuerOptions {
    // e.g. https://id.example.com, exactly as the identity provider names itself in its tokens
    issuer: string;
    // The audience the access tokens must be issued for, e.g. the project ID in Zitadel
    audience: string;
}

interface IssuerMetadata {
    jwks: ReturnType<typeof createRemoteJWKSet>;
    userInfoEndpoint: string;
}

export type AccessTokenPayload = JWTPayload & { sub: string };

// The identity provider as the API sees it: it checks access tokens against the provider's keys and reads the profile of their user
export class OidcIssuer {
    private metadata: Promise<IssuerMetadata> | undefined;

    constructor(private readonly options: OidcIssuerOptions) {}

    // Throws a JOSEError if the token is not signed by the issuer, expired or meant for another audience
    async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
        const { jwks } = await this.loadMetadata();
        const { payload } = await jwtVerify(token, jwks, { issuer: this.options.issuer, audience: this.options.audience });
        if (!payload.sub) {
            throw new Error("The access token has no subject");
        }
        return { ...payload, sub: payload.sub };
    }

    async fetchUserInfo(accessToken: string): Promise<unknown> {
        const { userInfoEndpoint } = await this.loadMetadata();
        const response = await fetch(userInfoEndpoint, { headers: { authorization: `Bearer ${accessToken}`, accept: "application/json" } });
        if (!response.ok) {
            throw new Error(`The userinfo endpoint answered with status ${response.status}`);
        }
        return response.json();
    }

    // Discovered on first use, so the API starts without the identity provider (e.g. for console commands and in CI)
    private loadMetadata(): Promise<IssuerMetadata> {
        this.metadata ??= this.discover().catch((error: unknown) => {
            this.metadata = undefined;
            throw error;
        });
        return this.metadata;
    }

    private async discover(): Promise<IssuerMetadata> {
        const response = await fetch(`${this.options.issuer.replace(/\/$/, "")}/.well-known/openid-configuration`);
        if (!response.ok) {
            throw new Error(`The OIDC discovery answered with status ${response.status}`);
        }
        const metadata = (await response.json()) as { issuer?: string; jwks_uri?: string; userinfo_endpoint?: string };
        if (metadata.issuer !== this.options.issuer) {
            throw new Error(`The identity provider calls itself ${metadata.issuer} instead of ${this.options.issuer}`);
        }
        if (!metadata.jwks_uri || !metadata.userinfo_endpoint) {
            throw new Error("The identity provider names no JWKS or userinfo endpoint");
        }
        return { jwks: createRemoteJWKSet(new URL(metadata.jwks_uri)), userInfoEndpoint: metadata.userinfo_endpoint };
    }
}
