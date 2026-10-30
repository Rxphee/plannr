import { fetchAllPages } from "@src/util/fetchAllPages";
import { graphQLFetch } from "@src/util/graphQLFetch";

import { labelOptionsQuery } from "./fetchLabelOptions.gql";
import type { GQLLabelOptionsQuery, GQLLabelOptionsQueryVariables } from "./fetchLabelOptions.gql.generated";

// All labels, for the label field of an issue and the label filter of the issue list
export async function fetchLabelOptions() {
    return fetchAllPages(async (pagination) => {
        const data = await graphQLFetch<GQLLabelOptionsQuery, GQLLabelOptionsQueryVariables>(labelOptionsQuery, pagination);
        return data.labels;
    });
}
