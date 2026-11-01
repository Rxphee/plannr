// Hues of the OKLCH color wheel without red, so nothing looks like an error.
// Neighbors differ strongly because similar values often land on neighboring entries.
const hues = [255, 55, 145, 320, 180, 80, 290, 220];

// The same value always gets the same hue, so a project (by its key) or a user (by their ID) is recognizable everywhere by its color
export function hueFor(value: string): number {
    // FNV-1a, its low bits spread well enough for a modulo over a short list
    let hash = 2166136261;
    for (const character of value) {
        hash ^= character.charCodeAt(0);
        hash = Math.imul(hash, 16777619) >>> 0;
    }
    return hues[hash % hues.length];
}
