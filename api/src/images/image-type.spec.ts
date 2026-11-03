import { describe, expect, it } from "vitest";

import { detectImageType } from "./image-type.js";

function bytes(...parts: (number[] | string)[]): Uint8Array {
    return new Uint8Array(parts.flatMap((part) => (typeof part === "string" ? [...part].map((character) => character.charCodeAt(0)) : part)));
}

describe("detectImageType", () => {
    it.each([
        ["image/png", bytes([0x89], "PNG", [0x0d, 0x0a, 0x1a, 0x0a, 0x00])],
        ["image/jpeg", bytes([0xff, 0xd8, 0xff, 0xe0])],
        ["image/gif", bytes("GIF89a", [0x01])],
        ["image/gif", bytes("GIF87a")],
        ["image/webp", bytes("RIFF", [0x24, 0x00, 0x00, 0x00], "WEBPVP8 ")],
    ])("detects %s from the first bytes", (contentType, content) => {
        expect(detectImageType(content)).toBe(contentType);
    });

    it.each([
        ["SVG", bytes('<svg xmlns="http://www.w3.org/2000/svg"></svg>')],
        ["an HTML page", bytes("<!doctype html>")],
        ["a RIFF file that is no WebP", bytes("RIFF", [0x24, 0x00, 0x00, 0x00], "WAVE")],
        ["a truncated PNG", bytes([0x89], "PNG")],
        ["an empty file", bytes()],
    ])("refuses %s", (_, content) => {
        expect(detectImageType(content)).toBeUndefined();
    });
});
