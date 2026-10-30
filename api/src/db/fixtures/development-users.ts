import type { UserIdentity } from "@src/users/users.service.js";

// The fixed users of the local identity provider in dev/keycloak/plannr-realm.json, which a spec keeps in sync.
// Their IDs there are the "sub" claims.
export const developmentUsers = {
    admin: { oidcSubject: "5d0c8a8e-2f4b-4c47-9a53-7c1e0a3b9f01", email: "admin@plannr.localhost", firstName: "Ada", lastName: "Admin" },
    max: { oidcSubject: "8f3e2b1a-6c5d-4e7f-8a9b-0c1d2e3f4a02", email: "max@plannr.localhost", firstName: "Max", lastName: "Mustermann" },
    erika: { oidcSubject: "2a7b9c4d-1e3f-4a5b-9c6d-7e8f9a0b1c03", email: "erika@plannr.localhost", firstName: "Erika", lastName: "Mustermann" },
} satisfies Record<string, UserIdentity>;
