import { PageHeader } from "@src/components/layout/PageHeader";
import { PageIntro } from "@src/components/layout/PageIntro";
import { ViewTabs } from "@src/components/layout/ViewTabs";
import { graphQLFetch } from "@src/util/graphQLFetch";
import { CalendarIcon, UsersIcon } from "lucide-react";
import { notFound } from "next/navigation";

import { ProjectIcon } from "../ProjectIcon";
import { ProjectStatusBadge } from "../ProjectStatusBadge";
import { projectLayoutQuery } from "./layout.gql";
import type { GQLProjectLayoutQuery, GQLProjectLayoutQueryVariables } from "./layout.gql.generated";

const dateFormat = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

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
            <PageIntro
                title={project.name}
                icon={<ProjectIcon projectKey={project.key} size="xl" />}
                badge={<ProjectStatusBadge status={project.status} />}
                meta={
                    <>
                        <span className="font-mono">{project.key}</span>
                        <span className="flex items-center gap-1">
                            <UsersIcon className="size-4" />
                            {project.members.length === 1 ? "1 member" : `${project.members.length} members`}
                        </span>
                        <span className="flex items-center gap-1">
                            <CalendarIcon className="size-4" />
                            Created {dateFormat.format(new Date(project.createdAt))}
                        </span>
                    </>
                }
                tabs={<ViewTabs tabs={tabs} />}
            />
            {children}
        </>
    );
}
