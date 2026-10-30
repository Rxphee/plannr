import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import { developmentUsers } from "./development-users.js";

interface RealmUser {
    id: string;
    email: string;
    emailVerified: boolean;
    firstName: string;
    lastName: string;
}

const realm = JSON.parse(readFileSync(new URL("../../../../dev/keycloak/plannr-realm.json", import.meta.url), "utf8")) as { users: RealmUser[] };

describe("developmentUsers", () => {
    it.each(Object.entries(developmentUsers))("matches %s in the realm of the local identity provider", (name, user) => {
        const realmUser = realm.users.find(({ id }) => id === user.oidcSubject);
        expect(realmUser).toMatchObject({
            email: user.email,
            emailVerified: user.isEmailVerified,
            firstName: user.firstName,
            lastName: user.lastName,
        });
    });
});
