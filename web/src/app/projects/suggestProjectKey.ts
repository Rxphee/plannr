const MAX_KEY_LENGTH = 5;
const SINGLE_WORD_KEY_LENGTH = 4;

// Suggests a project key from the name: the initials for several words ("Mobile App" → "MA"),
// otherwise the first letters of the word ("Plannr" → "PLAN"). Returns "" if no key with 2 letters can be derived.
export function suggestProjectKey(name: string): string {
    const words = name
        .normalize("NFD")
        // Drops the diacritics that NFD splits off ("Ü" → "U")
        .replace(/\p{M}/gu, "")
        .toUpperCase()
        .split(/[^A-Z]+/)
        .filter((word) => word.length > 0);

    const key = words.length > 1 ? words.map((word) => word[0]).join("") : (words[0] ?? "").slice(0, SINGLE_WORD_KEY_LENGTH);
    const truncatedKey = key.slice(0, MAX_KEY_LENGTH);
    return truncatedKey.length >= 2 ? truncatedKey : "";
}
