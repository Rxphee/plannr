import { Badge } from "@src/components/ui/Badge";
import type { GQLProjectStatus } from "@src/graphql.generated";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { connection } from "next/server";

import { CreateProjectDialog } from "./CreateProjectDialog";
import { projectsQuery } from "./page.gql";
import type { GQLProjectsQuery } from "./page.gql.generated";

const statusLabels: Record<GQLProjectStatus, string> = {
    active: "Active",
    paused: "Paused",
    archived: "Archived",
};

export default async function ProjectsPage() {
    // Render on every request, the API is not reachable at build time
    await connection();
    const { projects } = await graphQLFetch<GQLProjectsQuery>(projectsQuery);

    return (
        <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
            <div className="flex items-center justify-between gap-4">
                <h1 className="font-heading text-2xl font-semibold">Projects</h1>
                <CreateProjectDialog />
            </div>
            {projects.length === 0 ? (
                <p className="text-muted-foreground text-sm">No projects yet.</p>
            ) : (
                <ul className="divide-y rounded-lg border">
                    {projects.map((project) => (
                        <li key={project.id} className="flex items-center gap-4 px-4 py-3">
                            <span className="text-muted-foreground w-14 font-mono text-sm">{project.key}</span>
                            <span className="flex-1 font-medium">{project.name}</span>
                            <Badge variant={project.status === "active" ? "secondary" : "outline"}>{statusLabels[project.status]}</Badge>
                        </li>
                    ))}
                </ul>
            )}
        </main>
    );
}
