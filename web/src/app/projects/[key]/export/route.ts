import { apiFetch } from "@src/util/apiFetch";

const PASSED_ON_HEADERS = ["content-type", "content-length", "content-disposition", "cache-control"];

// The export of the project (a ZIP with project.json and the images), downloaded from the API with the user's access token
export async function GET(_request: Request, { params }: RouteContext<"/projects/[key]/export">) {
    const { key } = await params;
    const response = await apiFetch(`/projects/${encodeURIComponent(key)}/export`);
    if (!response.ok) {
        return new Response(null, { status: response.status });
    }

    const headers = new Headers({ "x-content-type-options": "nosniff" });
    for (const name of PASSED_ON_HEADERS) {
        const value = response.headers.get(name);
        if (value) {
            headers.set(name, value);
        }
    }
    return new Response(response.body, { headers });
}
