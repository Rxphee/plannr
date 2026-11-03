import { EntityManager } from "@mikro-orm/postgresql";
import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { StorageService } from "@src/storage/storage.service.js";

import { Image } from "./entities/image.entity.js";
import { imageStorageKey } from "./image-type.js";

// Gives an upload a day to land in a saved description, e.g. while someone is still writing it
const MINIMUM_AGE_IN_HOURS = 24;

// Any number, as long as no other advisory lock of Plannr uses it
const CLEANUP_LOCK_KEY = 4_117_001;

// Every image whose ID appears in a description, also in one of another project it was copied to
const UNUSED_IMAGES_QUERY = `
    select "id" from "Image"
    where "createdAt" < now() - make_interval(hours => ?)
    and "id"::text not in (
        select (regexp_matches("description", '/images/([0-9a-f-]{36})', 'g'))[1]
        from (
            select "description" from "Project"
            union all select "description" from "Epic"
            union all select "description" from "Issue"
        ) as "descriptions"
        where "description" like '%/images/%'
    )`;

// Mark and sweep instead of deleting on save: an upload that is never saved and an image copied into another
// description have no event that could delete them at the right time
@Injectable()
export class ImageCleanupService {
    private readonly logger = new Logger(ImageCleanupService.name);

    constructor(
        private readonly entityManager: EntityManager,
        private readonly storage: StorageService,
    ) {}

    // At night, when hardly anyone writes descriptions; the time zone is the server's
    @Cron("0 1 * * *", { name: "imageCleanup" })
    async runNightly(): Promise<void> {
        try {
            const deletedCount = await this.deleteUnusedImages();
            this.logger.log(`Deleted ${deletedCount} unused images`);
        } catch (error) {
            this.logger.error("The cleanup of unused images failed", error);
        }
    }

    // Returns the number of deleted images. An image whose object cannot be deleted keeps its row, so the next run tries again.
    async deleteUnusedImages(): Promise<number> {
        if (!this.storage.isEnabled) {
            return 0;
        }

        // A fork, as the job runs outside of any request
        return this.entityManager.fork().transactional(async (entityManager) => {
            // Only one instance of the API cleans up at a time; the lock ends with the transaction
            const [{ isLocked }] = await entityManager.execute<{ isLocked: boolean }[]>('select pg_try_advisory_xact_lock(?) as "isLocked"', [
                CLEANUP_LOCK_KEY,
            ]);
            if (!isLocked) {
                return 0;
            }

            const unusedImages = await entityManager.execute<{ id: string }[]>(UNUSED_IMAGES_QUERY, [MINIMUM_AGE_IN_HOURS]);
            const deletedIds: string[] = [];
            for (const { id } of unusedImages) {
                try {
                    await this.storage.deleteObject(imageStorageKey(id));
                    deletedIds.push(id);
                } catch (error) {
                    this.logger.warn(`The image ${id} could not be deleted from the storage, the next cleanup tries again`, error);
                }
            }
            if (deletedIds.length > 0) {
                await entityManager.nativeDelete(Image, { id: { $in: deletedIds } });
            }
            return deletedIds.length;
        });
    }
}
