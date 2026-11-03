import "reflect-metadata";

import { Body, Controller, Module, Post } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { useMcpBodyParser } from "./mcp-body-parser.js";

@Controller()
class EchoController {
    @Post("mcp")
    mcp(@Body() body: { text: string }): number {
        return body.text.length;
    }

    @Post("graphql")
    graphQL(@Body() body: { text: string }): number {
        return body.text.length;
    }
}

@Module({ controllers: [EchoController] })
class EchoModule {}

// A real Nest app, as the trap lies in how Nest registers its own body parsers
describe("useMcpBodyParser", () => {
    let app: NestExpressApplication;
    let url: string;

    beforeAll(async () => {
        app = await NestFactory.create<NestExpressApplication>(EchoModule, { logger: false });
        useMcpBodyParser(app, "/mcp");
        await app.listen(0, "127.0.0.1");
        url = await app.getUrl();
    });

    afterAll(async () => {
        await app.close();
    });

    async function post(path: string, textLength: number): Promise<{ status: number; body: string }> {
        const response = await fetch(`${url}${path}`, {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ text: "x".repeat(textLength) }),
        });
        return { status: response.status, body: await response.text() };
    }

    it("takes bodies larger than 100 kB on its path", async () => {
        expect(await post("/mcp", 3 * 1024 * 1024)).toEqual({ status: 201, body: String(3 * 1024 * 1024) });
    });

    it("keeps the JSON parser of Nest with its limit for every other route", async () => {
        expect(await post("/graphql", 1000)).toEqual({ status: 201, body: "1000" });
        expect((await post("/graphql", 300 * 1024)).status).toBe(413);
    });
});
