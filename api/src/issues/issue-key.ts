const ISSUE_KEY_PATTERN = /^([A-Z]{2,5})-([1-9]\d{0,8})$/;
// "42" or "WEB-42" in any case. Nine digits at most, so the number fits into an integer column.
const ISSUE_NUMBER_SEARCH_PATTERN = /^(?:[a-z]{2,5}-)?([1-9]\d{0,8})$/i;

export function parseIssueKey(key: string): { projectKey: string; number: number } | undefined {
    const match = ISSUE_KEY_PATTERN.exec(key);
    if (!match) {
        return undefined;
    }
    const [, projectKey, number] = match;
    return { projectKey, number: Number(number) };
}

export function findIssueNumberIn(search: string): number | undefined {
    const match = ISSUE_NUMBER_SEARCH_PATTERN.exec(search);
    return match ? Number(match[1]) : undefined;
}
