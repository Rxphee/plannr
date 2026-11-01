import { fetchAllPages } from "@src/util/fetchAllPages";
import { graphQLFetch } from "@src/util/graphQLFetch";

import { assigneeAdminsQuery, assigneeMembersQuery } from "./fetchAssigneeOptions.gql";
import type {
    GQLAssigneeAdminsQuery,
    GQLAssigneeAdminsQueryVariables,
    GQLAssigneeMembersQuery,
    GQLAssigneeMembersQueryVariables,
} from "./fetchAssigneeOptions.gql.generated";

export interface Assignee {
    id: string;
    firstName: string;
    lastName: string;
    // Admins without membership become members when an issue is assigned to them
    isMember: boolean;
}

// Everyone an issue of the project can be assigned to: the members and the admins without membership, sorted by name
export async function fetchAssigneeOptions(projectKey: string): Promise<Assignee[]> {
    const [members, admins] = await Promise.all([
        fetchAllPages(async (pagination) => {
            const data = await graphQLFetch<GQLAssigneeMembersQuery, GQLAssigneeMembersQueryVariables>(assigneeMembersQuery, {
                key: projectKey,
                ...pagination,
            });
            return data.project?.members ?? { nodes: [], totalCount: 0 };
        }),
        graphQLFetch<GQLAssigneeAdminsQuery, GQLAssigneeAdminsQueryVariables>(assigneeAdminsQuery, { key: projectKey }),
    ]);
    return [
        ...members.map(({ user }) => ({ ...user, isMember: true })),
        ...(admins.project?.adminsWithoutMembership ?? []).map((admin) => ({ ...admin, isMember: false })),
    ].sort(
        (first, second) =>
            first.firstName.localeCompare(second.firstName) || first.lastName.localeCompare(second.lastName) || first.id.localeCompare(second.id),
    );
}
