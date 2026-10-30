// Only paths of this app, so the login cannot be abused as an open redirect to another site
export function parseReturnTo(value: string | null | undefined): string {
    if (!value || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\") || value.startsWith("/auth/")) {
        return "/";
    }
    return value;
}
