import { registerEnumType } from "@nestjs/graphql";
import type { User } from "@src/users/user.entity.js";

export enum InstanceRole {
    superAdmin = "superAdmin",
    admin = "admin",
    user = "user",
}
registerEnumType(InstanceRole, { name: "InstanceRole" });

// The one place that decides the roles of the whole instance, so the super-admin counts as admin in every check.
// The super-admin comes from SUPER_ADMIN_EMAILS and cannot be taken away in Plannr, so nobody can lock them out.
export class InstanceRolesService {
    private readonly superAdminEmails: Set<string>;

    constructor(superAdminEmails: string[]) {
        this.superAdminEmails = new Set(superAdminEmails.map((email) => email.toLowerCase()));
    }

    // Only with a verified email address, otherwise anyone could become super-admin by entering the address at the identity provider
    isSuperAdmin(user: User): boolean {
        return user.isEmailVerified && this.superAdminEmails.has(user.email.toLowerCase());
    }

    // Admins see and manage all projects, users and labels
    hasAdminRights(user: User): boolean {
        return user.isAdmin || this.isSuperAdmin(user);
    }

    canAppointAdmins(user: User): boolean {
        return this.isSuperAdmin(user);
    }

    roleOf(user: User): InstanceRole {
        if (this.isSuperAdmin(user)) {
            return InstanceRole.superAdmin;
        }
        return user.isAdmin ? InstanceRole.admin : InstanceRole.user;
    }
}
