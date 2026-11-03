export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export type ImageContentType = "image/png" | "image/jpeg" | "image/gif" | "image/webp";

// Raster images only, never SVG: an SVG can carry scripts. The type comes from the first bytes of the file,
// not from the name or the type the client claims.
export function detectImageType(content: Uint8Array): ImageContentType | undefined {
    if (startsWith(content, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
        return "image/png";
    }
    if (startsWith(content, [0xff, 0xd8, 0xff])) {
        return "image/jpeg";
    }
    if (startsWithText(content, "GIF87a") || startsWithText(content, "GIF89a")) {
        return "image/gif";
    }
    if (startsWithText(content, "RIFF") && startsWithText(content.subarray(8), "WEBP")) {
        return "image/webp";
    }
    return undefined;
}

// The path of an image in the web app, which the descriptions link to in Markdown
export function imageUrl(id: string): string {
    return `/images/${id}`;
}

const IMAGE_URL_PATTERN = /\/images\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/g;

// The IDs of the images a Markdown text links to, each once
export function findImageIds(markdown: string): string[] {
    return [...new Set(Array.from(markdown.matchAll(IMAGE_URL_PATTERN), ([, id]) => id))];
}

export const IMAGE_FILE_EXTENSIONS: Record<ImageContentType, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
};

export function imageStorageKey(id: string): string {
    return `images/${id}`;
}

function startsWith(content: Uint8Array, bytes: number[]): boolean {
    return content.length >= bytes.length && bytes.every((byte, index) => content[index] === byte);
}

function startsWithText(content: Uint8Array, text: string): boolean {
    return startsWith(
        content,
        [...text].map((character) => character.charCodeAt(0)),
    );
}
