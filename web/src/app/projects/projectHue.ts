// Hues of the OKLCH color wheel without red, so a project never looks like an error.
// Neighbors differ strongly because similar keys often land on neighboring entries.
const projectHues = [255, 55, 145, 320, 180, 80, 290, 220];

// The same key always gets the same hue, so a project is recognizable everywhere by its color
export function projectHue(projectKey: string): number {
    // FNV-1a, its low bits spread well enough for a modulo over a short list
    let hash = 2166136261;
    for (const character of projectKey) {
        hash ^= character.charCodeAt(0);
        hash = Math.imul(hash, 16777619) >>> 0;
    }
    return projectHues[hash % projectHues.length];
}
