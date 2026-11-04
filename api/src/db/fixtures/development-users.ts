import type { UserIdentity } from "@src/users/users.service.js";

// The fixed users of the local Zitadel, created by dev/zitadel/setup.mts with these IDs, which are their "sub" claims.
// Their names say what they can do, because the development login lists them by name.
export const developmentUsers = {
    admin: {
        oidcSubject: "5d0c8a8e-2f4b-4c47-9a53-7c1e0a3b9f01",
        email: "admin@plannr.localhost",
        isEmailVerified: true,
        firstName: "Ada",
        lastName: "Admin",
    },
    owner: {
        oidcSubject: "8f3e2b1a-6c5d-4e7f-8a9b-0c1d2e3f4a02",
        email: "owner@plannr.localhost",
        isEmailVerified: true,
        firstName: "Olivia",
        lastName: "Owner",
    },
    member: {
        oidcSubject: "2a7b9c4d-1e3f-4a5b-9c6d-7e8f9a0b1c03",
        email: "member@plannr.localhost",
        isEmailVerified: true,
        firstName: "Mia",
        lastName: "Member",
    },
} satisfies Record<string, UserIdentity>;
