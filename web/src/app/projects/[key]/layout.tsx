import { PageHeader } from "@src/components/layout/PageHeader";
import { ViewTabs } from "@src/components/layout/ViewTabs";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { notFound } from "next/navigation";

import { ProjectKeyIcon } from "../ProjectKeyIcon";
import { ProjectStatusBadge } from "../ProjectStatusBadge";
import { projectLayoutQuery } from "./layout.gql";
import type { GQLProjectLayoutQuery, GQLProjectLayoutQueryVariables } from "./layout.gql.generated";

// Header and section tabs of a project; epics and issues will become further tabs
export default async function ProjectLayout({ children, params }: LayoutProps<"/projects/[key]">) {
    const { key } = await params;
    const { project } = await graphQLFetch<GQLProjectLayoutQuery, GQLProjectLayoutQueryVariables>(projectLayoutQuery, { key });
    if (!project) {
        notFound();
    }

    const tabs = [{ label: "Overview", href: `/projects/${project.key}` }];
    if (project.canManage) {
        tabs.push({ label: "Settings", href: `/projects/${project.key}/settings` });
    }

    return (
        <>
            <PageHeader breadcrumbs={[{ label: "Projects", href: "/projects" }, { label: project.name }]} />
            <div className="border-b px-4 pt-5 md:px-6">
                <div className="flex items-center gap-3">
                    <ProjectKeyIcon projectKey={project.key} size="lg" />
                    <div className="grid min-w-0">
                        <div className="flex items-center gap-2">
                            <h1 className="font-heading truncate text-xl font-semibold">{project.name}</h1>
                            <ProjectStatusBadge status={project.status} />
                        </div>
                        <span className="text-muted-foreground font-mono text-xs">{project.key}</span>
                    </div>
                </div>
                <ViewTabs tabs={tabs} className="mt-4" />
            </div>
            {children}
        </>
    );
}
