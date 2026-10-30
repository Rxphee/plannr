import { fetchAllPages } from "@src/util/fetchAllPages";
import { graphQLFetch } from "@src/util/graphQLFetch";
import type { PropsWithChildren } from "react";

import { quickCaptureProjectsQuery } from "./AppCommands.gql";
import type { GQLQuickCaptureProjectsQuery, GQLQuickCaptureProjectsQueryVariables } from "./AppCommands.gql.generated";
import { CommandMenuProvider } from "./CommandMenuProvider";

export type QuickCaptureProject = GQLQuickCaptureProjectsQuery["projects"]["nodes"][number];

// The search (⌘K) and the quick capture of issues (C), available on every page
export async function AppCommands({ children }: PropsWithChildren) {
    const projects = await fetchAllPages(async (pagination) => {
        const data = await graphQLFetch<GQLQuickCaptureProjectsQuery, GQLQuickCaptureProjectsQueryVariables>(quickCaptureProjectsQuery, pagination);
        return data.projects;
    });

    return (
        // Quick capture offers only the projects the user may add issues to
        <CommandMenuProvider projects={projects.filter((project) => project.canContribute)}>{children}</CommandMenuProvider>
    );
}
