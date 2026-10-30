"use server";

import { graphQLFetch } from "@src/util/graphQLFetch";

import { commandMenuSearchQuery } from "./searchCommandMenu.gql";
import type { GQLCommandMenuSearchQuery, GQLCommandMenuSearchQueryVariables } from "./searchCommandMenu.gql.generated";

export interface CommandMenuResults {
    projects: GQLCommandMenuSearchQuery["projects"]["nodes"];
    issues: GQLCommandMenuSearchQuery["issues"]["nodes"];
}

// A Server Function, so the search runs on the server with the session of the user like every other query
export async function searchCommandMenu(search: string): Promise<CommandMenuResults> {
    const { projects, issues } = await graphQLFetch<GQLCommandMenuSearchQuery, GQLCommandMenuSearchQueryVariables>(commandMenuSearchQuery, {
        search,
    });
    return { projects: projects.nodes, issues: issues.nodes };
}
