import { plainToInstance } from "class-transformer";
import { validateSync } from "class-validator";
import { describe, expect, it } from "vitest";

import { IssueLinkInput } from "./issue-link.input.js";

function validate(url: unknown) {
    const input = plainToInstance(IssueLinkInput, { issueId: "0b7f3a52-5c1e-4f0e-9d39-2f4a8e6b1c7d", url });
    return { input, invalidProperties: validateSync(input).map(({ property }) => property) };
}

describe("IssueLinkInput", () => {
    it.each(["https://github.com/Rxphee/plannr/pull/12", "http://localhost:3000/projects", "obsidian://open?vault=SecondBrain&file=Plannr"])(
        "accepts the link %s",
        (url) => {
            expect(validate(url).invalidProperties).toEqual([]);
        },
    );

    it("trims the link", () => {
        expect(validate(" https://example.com ").input.url).toBe("https://example.com");
    });

    it.each(["javascript:alert(1)", "ftp://example.com/file", "example.com", "", 42])("rejects %j", (url) => {
        expect(validate(url).invalidProperties).toEqual(["url"]);
    });
});
