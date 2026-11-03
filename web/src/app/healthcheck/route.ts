// For the healthcheck of the container: answers without a session and without asking the API, so it only tells whether the web server runs
export function GET() {
    return new Response("OK", { headers: { "cache-control": "no-store" } });
}
