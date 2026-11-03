import { afterEach, describe, expect, it, vi } from "vitest";

import { imageAltText, uploadImage } from "./uploadImage";

const png = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], "Screenshot.png", { type: "image/png" });

function mockFetch(response: Response | Error) {
    const fetchMock = response instanceof Error ? vi.fn().mockRejectedValue(response) : vi.fn().mockResolvedValue(response);
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
}

describe("uploadImage", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it("posts the image to the project and returns its URL", async () => {
        const fetchMock = mockFetch(Response.json({ id: "image-id", url: "/images/image-id" }));

        expect(await uploadImage("WEB", png)).toEqual({ url: "/images/image-id" });
        const [url, { method, body }] = fetchMock.mock.calls[0];
        expect([url, method]).toEqual(["/projects/WEB/images", "POST"]);
        expect((body as FormData).get("file")).toBeInstanceOf(File);
    });

    it.each([
        [403, "forbidden"],
        [413, "tooLarge"],
        [415, "typeNotSupported"],
        [500, "failed"],
    ])("turns the status %i into the error %s", async (status, error) => {
        mockFetch(new Response(null, { status }));
        expect(await uploadImage("WEB", png)).toEqual({ error });
    });

    it("reports a failed request", async () => {
        mockFetch(new TypeError("Failed to fetch"));
        expect(await uploadImage("WEB", png)).toEqual({ error: "failed" });
    });

    it("refuses types and sizes the API would refuse without uploading them", async () => {
        const fetchMock = mockFetch(Response.json({}));
        const svg = new File(["<svg></svg>"], "icon.svg", { type: "image/svg+xml" });
        const large = new File([new Uint8Array(10 * 1024 * 1024 + 1)], "large.png", { type: "image/png" });

        expect(await uploadImage("WEB", svg)).toEqual({ error: "typeNotSupported" });
        expect(await uploadImage("WEB", large)).toEqual({ error: "tooLarge" });
        expect(fetchMock).not.toHaveBeenCalled();
    });
});

describe("imageAltText", () => {
    it("takes the file name without its extension", () => {
        expect(imageAltText("Screenshot 2026-11-03 at 19.00.png")).toBe("Screenshot 2026-11-03 at 19.00");
        expect(imageAltText("diagram")).toBe("diagram");
    });
});
