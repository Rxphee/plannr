import { appUrl } from "@src/auth/oidc";
import { apiFetch } from "@src/util/apiFetch";

// Uploads an image of a description (multipart field "file") to the API and answers with its { id, url }
export async function POST(request: Request, { params }: RouteContext<"/projects/[key]/images">) {
    // Unlike Server Actions, route handlers get no check of the origin, and the session cookie is sent with same-site requests
    if (request.headers.get("origin") !== appUrl("/").origin) {
        return new Response(null, { status: 403 });
    }

    const { key } = await params;
    const response = await apiFetch(`/projects/${encodeURIComponent(key)}/images`, { method: "POST", body: await request.formData() });
    return new Response(response.body, {
        status: response.status,
        headers: { "content-type": response.headers.get("content-type") ?? "application/json" },
    });
}
