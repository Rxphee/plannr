import { apiFetch } from "@src/util/apiFetch";

const PASSED_ON_HEADERS = ["content-type", "content-length", "cache-control"];

// The images of the descriptions (![](/images/<id>) in Markdown), loaded from the API with the user's access token
export async function GET(_request: Request, { params }: RouteContext<"/images/[id]">) {
    const { id } = await params;
    const response = await apiFetch(`/images/${encodeURIComponent(id)}`);
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
