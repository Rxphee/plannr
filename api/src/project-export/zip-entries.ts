import { Zip, ZipDeflate, ZipPassThrough } from "fflate";

export interface ZipEntry {
    name: string;
    content: Uint8Array;
    // Images are compressed already, deflating them again only costs time
    shouldCompress?: boolean;
}

// Yields the archive piece by piece and asks for the next entry only when the reader wants more,
// so only one entry is in memory at a time
export async function* zipEntries(entries: AsyncIterable<ZipEntry>): AsyncGenerator<Uint8Array> {
    const chunks: Uint8Array[] = [];
    const errors: Error[] = [];
    const zip = new Zip((error, chunk) => {
        if (error) {
            errors.push(error);
            return;
        }
        chunks.push(chunk);
    });

    for await (const { name, content, shouldCompress } of entries) {
        const file = shouldCompress ? new ZipDeflate(name, { level: 6 }) : new ZipPassThrough(name);
        zip.add(file);
        file.push(content, true);
        if (errors.length > 0) {
            throw errors[0];
        }
        yield* chunks.splice(0);
    }
    zip.end();
    if (errors.length > 0) {
        throw errors[0];
    }
    yield* chunks.splice(0);
}
