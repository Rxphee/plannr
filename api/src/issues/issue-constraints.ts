import type { isURL } from "class-validator";

export const ISSUE_TITLE_MAX_LENGTH = 200;

// A date without time like 2026-10-29, as the LocalDate scalar and the date column use it
export const LOCAL_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Links point to pull requests, other websites or notes in Obsidian; other protocols like javascript: are refused
export const ISSUE_LINK_URL_OPTIONS: Parameters<typeof isURL>[1] = {
    protocols: ["http", "https", "obsidian"],
    require_protocol: true,
    // obsidian://open?vault=… has no top-level domain
    require_tld: false,
};
