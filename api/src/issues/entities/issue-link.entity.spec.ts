import { describe, expect, it } from "vitest";

import { detectIssueLinkKind, IssueLinkKind } from "./issue-link.entity.js";

describe("detectIssueLinkKind", () => {
    it.each([
        "https://github.com/Rxphee/plannr/pull/12",
        "https://github.com/Rxphee/plannr/pull/12/files",
        "https://github.com/npm/cli/pull/9800#issuecomment-1",
    ])("detects the pull request %s", (url) => {
        expect(detectIssueLinkKind(url)).toBe(IssueLinkKind.pullRequest);
    });

    it.each([
        "https://github.com/npm/cli/issues/9800",
        "https://github.com/Rxphee/plannr/pull/12abc",
        "https://example.com/github.com/Rxphee/plannr/pull/12",
        "obsidian://open?vault=SecondBrain&file=Plannr",
    ])("treats %s as another link", (url) => {
        expect(detectIssueLinkKind(url)).toBe(IssueLinkKind.other);
    });
});
