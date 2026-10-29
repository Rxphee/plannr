const GITHUB_PULL_REQUEST_URL = /^https:\/\/github\.com\/([\w.-]+\/[\w.-]+)\/pull\/(\d+)/;

// Pull requests read like Rxphee/plannr#12, other links show without their protocol
export function linkLabel({ url }: { url: string }): string {
    const pullRequest = GITHUB_PULL_REQUEST_URL.exec(url);
    if (pullRequest) {
        return `${pullRequest[1]}#${pullRequest[2]}`;
    }
    return url.replace(/^https?:\/\//, "");
}
