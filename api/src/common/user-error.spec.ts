import { BadRequestException } from "@nestjs/common";
import { GraphQLError } from "graphql";
import { describe, expect, it } from "vitest";

import { UserError, withUserErrorReason } from "./user-error.js";

// Errors of resolvers come as a GraphQLError with a path around the thrown exception
describe("withUserErrorReason", () => {
    const formattedError = { message: "The key WEB is already taken by another project", extensions: { code: "BAD_REQUEST" } };

    it("adds reason and params of a user error", () => {
        const error = new GraphQLError("resolver failed", {
            originalError: new UserError("projectKeyTaken", formattedError.message, { key: "WEB" }),
        });

        expect(withUserErrorReason(formattedError, error)).toEqual({
            ...formattedError,
            extensions: { code: "BAD_REQUEST", reason: "projectKeyTaken", params: { key: "WEB" } },
        });
    });

    it("leaves other errors alone", () => {
        const error = new GraphQLError("resolver failed", { path: ["createProject"], originalError: new BadRequestException("Something else") });

        expect(withUserErrorReason(formattedError, error)).toBe(formattedError);
    });

    it("stays a bad request for the MCP interface", () => {
        const error = new UserError("lastOwner", "A project needs at least one owner");

        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe("A project needs at least one owner");
    });
});
