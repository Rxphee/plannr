import { PageContent } from "@src/components/layout/PageContent";
import { PageHeader } from "@src/components/layout/PageHeader";
import { PageIntro } from "@src/components/layout/PageIntro";
import { ListPagination } from "@src/components/ListPagination";
import { ListSearch } from "@src/components/ListSearch";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@src/components/ui/Empty";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { pageCountOf, type Pagination, paginationHref, parsePagination, toOffsetAndLimit } from "@src/util/pagination";
import { parseSearch } from "@src/util/search";
import { SearchXIcon } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { usersPageQuery } from "./page.gql";
import type { GQLUsersPageQuery, GQLUsersPageQueryVariables } from "./page.gql.generated";
import { UserList } from "./UserList";

export default async function UsersPage({ searchParams }: PageProps<"/users">) {
    const resolvedSearchParams = await searchParams;
    const pagination = parsePagination(resolvedSearchParams);
    const search = parseSearch(resolvedSearchParams);
    const { canAppointAdmins, users } = await graphQLFetch<GQLUsersPageQuery, GQLUsersPageQueryVariables>(usersPageQuery, {
        search,
        ...toOffsetAndLimit(pagination),
    });
    // Only for the super-admin, like the sidebar link
    if (!canAppointAdmins) {
        notFound();
    }
    const usersHref = (otherPagination: Pagination) => paginationHref("/users", otherPagination, search ? { search } : {});
    // A page behind the last one, e.g. from an old link, shows the last one instead
    const pageCount = pageCountOf(users.totalCount, pagination);
    if (pagination.page > pageCount) {
        redirect(usersHref({ ...pagination, page: pageCount }));
    }

    return (
        <>
            <PageHeader breadcrumbs={[{ label: "Users" }]} />
            <PageIntro
                title="Users"
                description="Everyone who has logged in. Admins see and manage all projects and labels; only you as super-admin appoint them."
            />
            <PageContent className="grid gap-4">
                <ListSearch placeholder="Search name or email" label="Search users" />
                {users.totalCount === 0 ? (
                    <Empty className="rounded-xl border border-dashed">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <SearchXIcon />
                            </EmptyMedia>
                            <EmptyTitle>No matching users</EmptyTitle>
                            <EmptyDescription>Search for another name or email to see more users.</EmptyDescription>
                        </EmptyHeader>
                    </Empty>
                ) : (
                    <>
                        <UserList users={users.nodes} />
                        <ListPagination pagination={pagination} totalCount={users.totalCount} href={usersHref} />
                    </>
                )}
            </PageContent>
        </>
    );
}
