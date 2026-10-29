import { buttonVariants } from "@src/components/ui/Button";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { ArrowLeftIcon, SettingsIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProjectStatusBadge } from "../ProjectStatusBadge";
import { projectQuery } from "./page.gql";
import type { GQLProjectQuery, GQLProjectQueryVariables } from "./page.gql.generated";
import { projectMemberRoleLabels } from "./projectMemberRoles";

export default async function ProjectPage({ params }: PageProps<"/projects/[key]">) {
    const { key } = await params;
    const { project } = await graphQLFetch<GQLProjectQuery, GQLProjectQueryVariables>(projectQuery, { key });
    if (!project) {
        notFound();
    }

    return (
        <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
            <Link href="/projects" className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 text-sm">
                <ArrowLeftIcon className="size-4" />
                Projects
            </Link>
            <div className="flex items-start justify-between gap-4">
                <div className="grid gap-1">
                    <span className="text-muted-foreground font-mono text-sm">{project.key}</span>
                    <div className="flex items-center gap-3">
                        <h1 className="font-heading text-2xl font-semibold">{project.name}</h1>
                        <ProjectStatusBadge status={project.status} />
                    </div>
                </div>
                {project.canManage && (
                    <Link href={`/projects/${project.key}/settings`} className={buttonVariants({ variant: "outline" })}>
                        <SettingsIcon />
                        Settings
                    </Link>
                )}
            </div>
            {project.description && <p className="whitespace-pre-line">{project.description}</p>}
            <section className="grid gap-3">
                <h2 className="font-heading text-lg font-semibold">Members</h2>
                <ul className="divide-y rounded-lg border">
                    {project.members.map(({ role, user }) => (
                        <li key={user.id} className="flex items-center justify-between gap-4 px-4 py-3">
                            <span>
                                {user.firstName} {user.lastName}
                            </span>
                            <span className="text-muted-foreground text-sm">{projectMemberRoleLabels[role]}</span>
                        </li>
                    ))}
                </ul>
            </section>
        </main>
    );
}
