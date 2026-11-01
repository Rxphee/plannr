export const PROJECT_KEY_PATTERN = /^[A-Z]{2,5}$/;
export const PROJECT_KEY_MAX_LENGTH = 5;
export const PROJECT_NAME_MAX_LENGTH = 50;

// An empty key is the job of the required check
export function isValidProjectKey(key: string | undefined): boolean {
    return !key || PROJECT_KEY_PATTERN.test(key);
}
