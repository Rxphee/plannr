// Like the API (detectImageType and MAX_IMAGE_SIZE in api/src/images/image-type.ts), which checks them again
export const SUPPORTED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

export type ImageUploadError = "tooLarge" | "typeNotSupported" | "forbidden" | "failed";

const errorsByStatus: Record<number, ImageUploadError> = { 403: "forbidden", 413: "tooLarge", 415: "typeNotSupported" };

export async function uploadImage(projectKey: string, file: File): Promise<{ url: string } | { error: ImageUploadError }> {
    if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
        return { error: "typeNotSupported" };
    }
    if (file.size > MAX_IMAGE_SIZE) {
        return { error: "tooLarge" };
    }

    const body = new FormData();
    body.append("file", file);
    try {
        const response = await fetch(`/projects/${encodeURIComponent(projectKey)}/images`, { method: "POST", body });
        if (!response.ok) {
            return { error: errorsByStatus[response.status] ?? "failed" };
        }
        const { url } = (await response.json()) as { url: string };
        return { url };
    } catch {
        return { error: "failed" };
    }
}

// The file name without its extension, e.g. "Screenshot 2026-11-03" for "Screenshot 2026-11-03.png"
export function imageAltText(fileName: string): string {
    return fileName.replace(/\.[^.]+$/, "");
}
