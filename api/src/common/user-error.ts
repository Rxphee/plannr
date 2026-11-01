import { BadRequestException } from "@nestjs/common";
import type { GraphQLFormattedError } from "graphql";

// The input errors a client may show in its own words; the web app keeps a text for each in its messages (apiErrors)
export type UserErrorReason =
    | "projectKeyTaken"
    | "projectNotArchived"
    | "userNotFound"
    | "alreadyMembers"
    | "notAMember"
    | "lastOwner"
    | "labelNotFound"
    | "labelNameTaken"
    | "superAdminAlwaysAdmin"
    | "issueLinkExists"
    | "epicNotInProject"
    | "defaultEpicNotDeletable"
    | "moveIssuesToOtherEpic";

export type UserErrorParams = Record<string, string | number | string[]>;

// Input the user can correct. The message stays English for the MCP interface and the logs,
// reason and params go to GraphQL clients, so they can translate it.
export class UserError extends BadRequestException {
    constructor(
        readonly reason: UserErrorReason,
        message: string,
        readonly params: UserErrorParams = {},
    ) {
        super(message);
    }
}

// Adds reason and params of a UserError to the extensions of its GraphQL error
export function withUserErrorReason(formattedError: GraphQLFormattedError, error: unknown): GraphQLFormattedError {
    const userError = findUserError(error);
    if (!userError) {
        return formattedError;
    }
    return { ...formattedError, extensions: { ...formattedError.extensions, reason: userError.reason, params: userError.params } };
}

// Follows originalError instead of Apollo's unwrapResolverError, whose instanceof check misses a GraphQLError from the other module copy of graphql (CommonJS and ESM)
function findUserError(error: unknown): UserError | undefined {
    let current = error;
    while (current instanceof Error) {
        if (current instanceof UserError) {
            return current;
        }
        current = (current as { originalError?: unknown }).originalError;
    }
    return undefined;
}
