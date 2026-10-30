import type { IncomingMessage, ServerResponse } from "node:http";

import { Controller, Delete, Get, Post, Req, Res } from "@nestjs/common";
import { CurrentUser } from "@src/auth/current-user.decorator.js";
import type { User } from "@src/users/user.entity.js";

import { handleMcpRequest } from "./mcp-server.js";
import { McpToolsService } from "./mcp-tools.service.js";

// The MCP interface at /api/mcp (Streamable HTTP), logged in like every other request, e.g. with an API token
@Controller("mcp")
export class McpController {
    constructor(private readonly mcpToolsService: McpToolsService) {}

    @Post()
    async handle(@Req() request: IncomingMessage & { body: unknown }, @Res() response: ServerResponse, @CurrentUser() user: User): Promise<void> {
        await handleMcpRequest({ request, response, body: request.body, tools: this.mcpToolsService, user });
    }

    // Without sessions there is no event stream to open (GET) and no session to end (DELETE)
    @Get()
    rejectGet(@Res() response: ServerResponse): void {
        rejectMethod(response);
    }

    @Delete()
    rejectDelete(@Res() response: ServerResponse): void {
        rejectMethod(response);
    }
}

function rejectMethod(response: ServerResponse): void {
    response.writeHead(405, { allow: "POST", "content-type": "application/json" });
    response.end(JSON.stringify({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed" }, id: null }));
}
