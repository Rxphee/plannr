// A LIKE pattern that finds the text anywhere, with % and _ in the text matched literally
export function containsPattern(text: string): string {
    return `%${text.replace(/[\\%_]/g, "\\$&")}%`;
}
