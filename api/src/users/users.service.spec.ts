import { type EntityManager, UniqueConstraintViolationException } from "@mikro-orm/postgresql";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { User } from "./user.entity.js";
import { type UserIdentity, UsersService } from "./users.service.js";

const identity: UserIdentity = {
    oidcSubject: "user-1",
    email: "erika@example.com",
    isEmailVerified: true,
    firstName: "Erika",
    lastName: "Mustermann",
};

describe("UsersService.syncIdentity", () => {
    let fork: { create: ReturnType<typeof vi.fn>; flush: ReturnType<typeof vi.fn> };
    let entityManager: {
        findOne: ReturnType<typeof vi.fn>;
        findOneOrFail: ReturnType<typeof vi.fn>;
        assign: ReturnType<typeof vi.fn>;
        flush: ReturnType<typeof vi.fn>;
        fork: () => typeof fork;
    };
    let usersService: UsersService;

    beforeEach(() => {
        fork = { create: vi.fn(), flush: vi.fn() };
        entityManager = {
            findOne: vi.fn().mockResolvedValue(null),
            findOneOrFail: vi.fn(),
            assign: vi.fn((user: User, data: UserIdentity) => Object.assign(user, data)),
            flush: vi.fn(),
            fork: () => fork,
        };
        usersService = new UsersService(entityManager as unknown as EntityManager);
    });

    it("creates the user on the first login", async () => {
        const createdUser = { id: "1", ...identity };
        entityManager.findOneOrFail.mockResolvedValue(createdUser);

        await expect(usersService.syncIdentity(identity)).resolves.toBe(createdUser);
        expect(fork.create).toHaveBeenCalledWith(expect.anything(), identity);
        expect(fork.flush).toHaveBeenCalled();
    });

    it("takes over a changed email address and name", async () => {
        const existingUser = { id: "1", oidcSubject: "user-1", email: "old@example.com", firstName: "Erika", lastName: "Musterfrau" };
        entityManager.findOne.mockResolvedValue(existingUser);

        await expect(usersService.syncIdentity(identity)).resolves.toMatchObject({ id: "1", ...identity });
        expect(entityManager.flush).toHaveBeenCalled();
        expect(fork.create).not.toHaveBeenCalled();
    });

    it("returns the user that a parallel request created", async () => {
        const createdUser = { id: "1", ...identity };
        entityManager.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(createdUser);
        fork.flush.mockRejectedValue(new UniqueConstraintViolationException(new Error("duplicate key")));

        await expect(usersService.syncIdentity(identity)).resolves.toBe(createdUser);
    });

    it("fails if the email address belongs to another user", async () => {
        const error = new UniqueConstraintViolationException(new Error("duplicate key"));
        fork.flush.mockRejectedValue(error);

        await expect(usersService.syncIdentity(identity)).rejects.toBe(error);
    });
});
