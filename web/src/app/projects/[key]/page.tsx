import { UserAvatar } from "@src/components/UserAvatar";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { notFound } from "next/navigation";

import { projectQuery } from "./page.gql";
import type { GQLProjectQuery, GQLProjectQueryVariables } from "./page.gql.generated";
import { projectMemberRoleLabels } from "./projectMemberRoles";

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export default async function ProjectPage({ params }: PageProps<"/projects/[key]">) {
    const { key } = await params;
    const { project } = await graphQLFetch<GQLProjectQuery, GQLProjectQueryVariables>(projectQuery, { key });
    if (!project) {
        notFound();
    }

    return (
        <div className="grid gap-8 p-4 md:grid-cols-[1fr_16rem] md:p-6">
            <section className="grid content-start gap-2">
                <h2 className="text-muted-foreground text-sm font-medium">Description</h2>
                {project.description ? (
                    <p className="whitespace-pre-line">{project.description}</p>
                ) : (
                    <p className="text-muted-foreground text-sm">No description yet.</p>
                )}
            </section>
            <aside className="grid content-start gap-6 text-sm">
                <section className="grid gap-3">
                    <h2 className="text-muted-foreground font-medium">Members</h2>
                    <ul className="grid gap-2">
                        {project.members.map(({ role, user }) => (
                            <li key={user.id} className="flex items-center gap-2">
                                <UserAvatar user={user} size="sm" />
                                <span className="flex-1 truncate">
                                    {user.firstName} {user.lastName}
                                </span>
                                <span className="text-muted-foreground text-xs">{projectMemberRoleLabels[role]}</span>
                            </li>
                        ))}
                    </ul>
                </section>
                <section className="grid gap-1">
                    <h2 className="text-muted-foreground font-medium">Created</h2>
                    <span>{dateFormat.format(new Date(project.createdAt))}</span>
                </section>
            </aside>
        </div>
    );
}
