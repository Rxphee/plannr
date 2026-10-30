import type { EntityManager } from "@mikro-orm/postgresql";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { InstanceRolesService } from "@src/instance-roles/instance-roles.service.js";
import { User } from "@src/users/user.entity.js";
import { describe, expect, it, vi } from "vitest";

import { Label, LabelColor } from "./entities/label.entity.js";
import { LabelsService } from "./labels.service.js";

function createUser(isAdmin: boolean, { email = "anna@plannr.localhost", isEmailVerified = true } = {}): User {
    return Object.assign(new User(), { firstName: "Anna", lastName: "Pichler", email, isEmailVerified, oidcSubject: "anna", isAdmin });
}

function createService(labels: Label[] = []) {
    const entityManager = {
        find: vi.fn(async () => labels),
        findOne: vi.fn(async () => labels[0] ?? null),
        create: vi.fn((_entity: unknown, data: Partial<Label>) => Object.assign(new Label(), data)),
        flush: vi.fn(async () => {}),
        remove: vi.fn(() => entityManager),
    };
    const instanceRoles = new InstanceRolesService(["ada@plannr.localhost"]);
    return { service: new LabelsService(entityManager as unknown as EntityManager, instanceRoles), entityManager };
}

const upstream = Object.assign(new Label(), { name: "upstream", color: LabelColor.red });

describe("LabelsService", () => {
    it("lets only admins manage labels", () => {
        const { service } = createService();
        expect(service.canManage(createUser(true))).toBe(true);
        expect(service.canManage(createUser(false))).toBe(false);
    });

    it("lets the super-admin manage labels without the admin flag", () => {
        const { service } = createService();
        expect(service.canManage(createUser(false, { email: "ada@plannr.localhost" }))).toBe(true);
        expect(service.canManage(createUser(false, { email: "ada@plannr.localhost", isEmailVerified: false }))).toBe(false);
    });

    it("creates a label for an admin", async () => {
        const { service, entityManager } = createService();
        const label = await service.create({ name: "upstream", color: LabelColor.red }, createUser(true));
        expect(label.name).toBe("upstream");
        expect(entityManager.flush).toHaveBeenCalled();
    });

    it.each([
        ["create", (service: LabelsService, user: User) => service.create({ name: "upstream", color: LabelColor.red }, user)],
        ["update", (service: LabelsService, user: User) => service.update(upstream.id, { color: LabelColor.blue }, user)],
        ["delete", (service: LabelsService, user: User) => service.delete(upstream.id, user)],
    ])("refuses to %s a label for other users", async (_, change) => {
        const { service, entityManager } = createService([upstream]);
        await expect(change(service, createUser(false))).rejects.toThrow(ForbiddenException);
        expect(entityManager.flush).not.toHaveBeenCalled();
    });

    it("finds the labels of an issue once each", async () => {
        const { service, entityManager } = createService([upstream]);
        await expect(service.findByIds([upstream.id, upstream.id])).resolves.toEqual([upstream]);
        expect(entityManager.find).toHaveBeenCalledWith(Label, { id: { $in: [upstream.id] } });
    });

    it("rejects labels that do not exist", async () => {
        const { service } = createService([upstream]);
        await expect(service.findByIds([upstream.id, "6e2d9c41-8a3b-4b7f-a1e5-3c9d7f2b8e60"])).rejects.toThrow(BadRequestException);
    });
});
