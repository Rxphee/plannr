export const PROJECT_KEY_PATTERN = /^[A-Z]{2,5}$/;
export const PROJECT_KEY_MAX_LENGTH = 5;
export const PROJECT_NAME_MAX_LENGTH = 50;

export function validateProjectKey(key: string | undefined): string | undefined {
    if (key && !PROJECT_KEY_PATTERN.test(key)) {
        return "2 to 5 uppercase letters";
    }
    return undefined;
}
