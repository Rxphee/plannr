import { randomUUID } from "node:crypto";

import type { StorageService } from "./storage.service.js";

// Goes the whole way an image will go, so a wrong endpoint, key or bucket shows up before the first upload
export async function checkStorage(storage: StorageService): Promise<void> {
    if (!storage.isEnabled) {
        throw new Error("No S3 storage is configured: set S3_ENDPOINT and the other S3 variables");
    }

    const key = `storage-check/${randomUUID()}.txt`;
    const content = new TextEncoder().encode("Plannr storage check");
    await storage.putObject({ key, body: content, contentType: "text/plain" });
    try {
        const storedContent = await storage.getObject(key);
        if (Buffer.compare(storedContent, content) !== 0) {
            throw new Error("The S3 storage returned other content than was written");
        }
    } finally {
        await storage.deleteObject(key);
    }
}
