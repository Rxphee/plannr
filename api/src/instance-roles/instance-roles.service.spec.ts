import { User } from "@src/users/user.entity.js";
import { describe, expect, it } from "vitest";

import { InstanceRole, InstanceRolesService } from "./instance-roles.service.js";

function createUser({ email = "ada@plannr.localhost", isEmailVerified = true, isAdmin = false } = {}): User {
    return Object.assign(new User(), { firstName: "Ada", lastName: "Admin", oidcSubject: "ada", email, isEmailVerified, isAdmin });
}

const instanceRoles = new InstanceRolesService(["Ada@Plannr.localhost"]);

describe("InstanceRolesService", () => {
    it("makes a user with a listed and verified email address super-admin", () => {
        const user = createUser();
        expect(instanceRoles.isSuperAdmin(user)).toBe(true);
        expect(instanceRoles.roleOf(user)).toBe(InstanceRole.superAdmin);
    });

    it("compares the email addresses case-insensitively", () => {
        expect(instanceRoles.isSuperAdmin(createUser({ email: "ADA@plannr.LOCALHOST" }))).toBe(true);
    });

    it("does not make a user with an unverified email address super-admin", () => {
        const user = createUser({ isEmailVerified: false });
        expect(instanceRoles.isSuperAdmin(user)).toBe(false);
        expect(instanceRoles.hasAdminRights(user)).toBe(false);
        expect(instanceRoles.roleOf(user)).toBe(InstanceRole.user);
    });

    it("does not make a user with another email address super-admin", () => {
        expect(instanceRoles.isSuperAdmin(createUser({ email: "max@plannr.localhost" }))).toBe(false);
    });

    it("has no super-admin without email addresses", () => {
        expect(new InstanceRolesService([]).isSuperAdmin(createUser())).toBe(false);
    });

    it("gives the super-admin admin rights without the admin flag", () => {
        expect(instanceRoles.hasAdminRights(createUser({ isAdmin: false }))).toBe(true);
    });

    it("gives admins admin rights", () => {
        const admin = createUser({ email: "max@plannr.localhost", isAdmin: true });
        expect(instanceRoles.hasAdminRights(admin)).toBe(true);
        expect(instanceRoles.roleOf(admin)).toBe(InstanceRole.admin);
    });

    it("lets only the super-admin appoint admins", () => {
        expect(instanceRoles.canAppointAdmins(createUser())).toBe(true);
        expect(instanceRoles.canAppointAdmins(createUser({ email: "max@plannr.localhost", isAdmin: true }))).toBe(false);
        expect(instanceRoles.canAppointAdmins(createUser({ email: "erika@plannr.localhost" }))).toBe(false);
    });
});
