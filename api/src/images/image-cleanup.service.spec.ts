import type { EntityManager } from "@mikro-orm/postgresql";
import type { StorageService } from "@src/storage/storage.service.js";
import { describe, expect, it, vi } from "vitest";

import { Image } from "./entities/image.entity.js";
import { ImageCleanupService } from "./image-cleanup.service.js";

// The query itself runs against Postgres, so the specs cover what the service does with its answer
function createService({ isStorageEnabled = true, isLocked = true, unusedIds = ["unused-1", "unused-2"], failingIds = [] as string[] } = {}) {
    const transactionEntityManager = {
        execute: vi.fn(async (sql: string) => (sql.includes("pg_try_advisory_xact_lock") ? [{ isLocked }] : unusedIds.map((id) => ({ id })))),
        nativeDelete: vi.fn(),
    };
    const entityManager = {
        fork: () => ({ transactional: (work: (entityManager: unknown) => Promise<number>) => work(transactionEntityManager) }),
    };
    const storage = {
        isEnabled: isStorageEnabled,
        deleteObject: vi.fn(async (key: string) => {
            if (failingIds.some((id) => key.endsWith(id))) {
                throw new Error("Storage unavailable");
            }
        }),
    };
    const service = new ImageCleanupService(entityManager as unknown as EntityManager, storage as unknown as StorageService);
    return { service, storage, transactionEntityManager };
}

describe("ImageCleanupService.deleteUnusedImages", () => {
    it("deletes the object and then the row of every unused image", async () => {
        const { service, storage, transactionEntityManager } = createService();

        expect(await service.deleteUnusedImages()).toBe(2);
        expect(storage.deleteObject.mock.calls).toEqual([["images/unused-1"], ["images/unused-2"]]);
        expect(transactionEntityManager.nativeDelete).toHaveBeenCalledWith(Image, { id: { $in: ["unused-1", "unused-2"] } });
    });

    it("keeps the row of an image whose object could not be deleted, so the next run tries again", async () => {
        const { service, transactionEntityManager } = createService({ failingIds: ["unused-1"] });

        expect(await service.deleteUnusedImages()).toBe(1);
        expect(transactionEntityManager.nativeDelete).toHaveBeenCalledWith(Image, { id: { $in: ["unused-2"] } });
    });

    it("leaves the work to another instance that holds the lock", async () => {
        const { service, storage } = createService({ isLocked: false });

        expect(await service.deleteUnusedImages()).toBe(0);
        expect(storage.deleteObject).not.toHaveBeenCalled();
    });

    it("does nothing without a storage", async () => {
        const { service, transactionEntityManager } = createService({ isStorageEnabled: false });

        expect(await service.deleteUnusedImages()).toBe(0);
        expect(transactionEntityManager.execute).not.toHaveBeenCalled();
    });

    it("skips the delete when nothing is unused", async () => {
        const { service, transactionEntityManager } = createService({ unusedIds: [] });

        expect(await service.deleteUnusedImages()).toBe(0);
        expect(transactionEntityManager.nativeDelete).not.toHaveBeenCalled();
    });
});
