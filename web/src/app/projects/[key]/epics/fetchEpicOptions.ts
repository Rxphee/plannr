import { fetchAllPages } from "@src/util/fetchAllPages";
import { graphQLFetch } from "@src/util/graphQLFetch";

import { epicOptionsQuery } from "./fetchEpicOptions.gql";
import type { GQLEpicOptionsQuery, GQLEpicOptionsQueryVariables } from "./fetchEpicOptions.gql.generated";

// All epics of a project, for the epic field of an issue and the epic filter of the issue list
export async function fetchEpicOptions(projectId: string) {
    return fetchAllPages(async (pagination) => {
        const data = await graphQLFetch<GQLEpicOptionsQuery, GQLEpicOptionsQueryVariables>(epicOptionsQuery, { projectId, ...pagination });
        return data.epics;
    });
}
