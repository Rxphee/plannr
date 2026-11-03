import type { NestExpressApplication } from "@nestjs/platform-express";
import { MAX_IMAGE_SIZE } from "@src/images/image-type.js";
import { json, type NextFunction, type Request, type Response } from "express";

// Room for the largest image as Base64 (4 characters per 3 bytes) and the rest of the request
const MCP_BODY_LIMIT = Math.ceil(MAX_IMAGE_SIZE / 3) * 4 + 1024 * 1024;

// upload_image takes images as Base64, which exceeds the default limit of 100 kB. Only for MCP, as the body is read before the login.
// Register it before the app starts: Nest adds its own parsers then, and they skip a body that was read already.
export function useMcpBodyParser(app: NestExpressApplication, path: string): void {
    const parseJson = json({ limit: MCP_BODY_LIMIT });
    // Wrapped, because Nest leaves out its JSON parser for every route when it finds a middleware named jsonParser,
    // and GraphQL would get no body at all
    app.use(path, (request: Request, response: Response, next: NextFunction) => parseJson(request, response, next));
}
