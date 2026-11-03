import type { Epic } from "@src/epics/entities/epic.entity.js";
import type { Issue, IssuePriority, IssueStatus, IssueType } from "@src/issues/entities/issue.entity.js";
import type { IssueLinkKind } from "@src/issues/entities/issue-link.entity.js";
import type { Label, LabelColor } from "@src/labels/entities/label.entity.js";
import type { Project, ProjectStatus } from "@src/projects/entities/project.entity.js";
import type { ProjectMember, ProjectMemberRole } from "@src/projects/entities/project-member.entity.js";
import type { User } from "@src/users/user.entity.js";

// Raised whenever a field changes its meaning or goes away, so a later import can tell the formats apart
export const PROJECT_EXPORT_VERSION = 1;

// Users and labels are referenced by email and name, which stay meaningful in another instance, unlike the IDs of this one
interface ExportedUser {
    email: string;
    firstName: string;
    lastName: string;
}

interface ExportedLabel {
    name: string;
    color: LabelColor;
}

interface ExportedMember {
    user: string;
    role: ProjectMemberRole;
    createdAt: Date;
}

interface ExportedIssueLink {
    url: string;
    kind: IssueLinkKind;
    createdAt: Date;
}

interface ExportedIssue {
    id: string;
    key: string;
    number: number;
    title: string;
    type: IssueType;
    status: IssueStatus;
    priority: IssuePriority;
    dueDate: string | null;
    description: string;
    labels: string[];
    links: ExportedIssueLink[];
    assignee: string | null;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    completedAt: Date | null;
}

interface ExportedEpic {
    id: string;
    name: string;
    description: string;
    isDefault: boolean;
    createdAt: Date;
    updatedAt: Date;
    issues: ExportedIssue[];
}

export interface ProjectExport {
    version: number;
    exportedAt: Date;
    project: {
        id: string;
        key: string;
        name: string;
        description: string;
        status: ProjectStatus;
        createdBy: string;
        createdAt: Date;
        updatedAt: Date;
        archivedAt: Date | null;
        members: ExportedMember[];
        epics: ExportedEpic[];
    };
    users: ExportedUser[];
    labels: ExportedLabel[];
}

interface ProjectExportSource {
    // With createdBy loaded
    project: Project;
    // With their users loaded
    members: ProjectMember[];
    // In the order of the export, each with its issues in the order of the export
    epics: Epic[];
    // With labels, links, assignee and createdBy loaded
    issues: Issue[];
    exportedAt: Date;
}

export function buildProjectExport({ project, members, epics, issues, exportedAt }: ProjectExportSource): ProjectExport {
    const users = new Map<string, User>();
    const labels = new Map<string, Label>();
    const referenceUser = (user: User): string => {
        users.set(user.id, user);
        return user.email;
    };

    const issuesByEpic = new Map<string, Issue[]>();
    for (const issue of issues) {
        issuesByEpic.set(issue.epic.id, [...(issuesByEpic.get(issue.epic.id) ?? []), issue]);
    }
    const exportIssue = (issue: Issue): ExportedIssue => {
        const issueLabels = issue.labels.getItems();
        for (const label of issueLabels) {
            labels.set(label.id, label);
        }
        const assignee = issue.assignee?.getEntity();
        return {
            id: issue.id,
            key: `${project.key}-${issue.number}`,
            number: issue.number,
            title: issue.title,
            type: issue.type,
            status: issue.status,
            priority: issue.priority,
            dueDate: issue.dueDate,
            description: issue.description,
            labels: issueLabels.map(({ name }) => name),
            links: issue.links.getItems().map(({ url, kind, createdAt }) => ({ url, kind, createdAt })),
            assignee: assignee ? referenceUser(assignee) : null,
            createdBy: referenceUser(issue.createdBy.getEntity()),
            createdAt: issue.createdAt,
            updatedAt: issue.updatedAt,
            completedAt: issue.completedAt,
        };
    };

    const exportedProject: ProjectExport["project"] = {
        id: project.id,
        key: project.key,
        name: project.name,
        description: project.description,
        status: project.status,
        createdBy: referenceUser(project.createdBy.getEntity()),
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        archivedAt: project.archivedAt,
        members: members.map((member) => ({ user: referenceUser(member.user.getEntity()), role: member.role, createdAt: member.createdAt })),
        epics: epics.map((epic) => ({
            id: epic.id,
            name: epic.name,
            description: epic.description,
            isDefault: epic.isDefault,
            createdAt: epic.createdAt,
            updatedAt: epic.updatedAt,
            issues: (issuesByEpic.get(epic.id) ?? []).map(exportIssue),
        })),
    };

    return {
        version: PROJECT_EXPORT_VERSION,
        exportedAt,
        project: exportedProject,
        users: [...users.values()]
            .sort((first, second) => first.email.localeCompare(second.email))
            .map(({ email, firstName, lastName }) => ({ email, firstName, lastName })),
        labels: [...labels.values()].sort((first, second) => first.name.localeCompare(second.name)).map(({ name, color }) => ({ name, color })),
    };
}

// e.g. plannr-WEB-2026-11-03.json, with the day of the export in UTC
export function projectExportFileName({ project, exportedAt }: Pick<ProjectExport, "project" | "exportedAt">): string {
    return `plannr-${project.key}-${exportedAt.toISOString().slice(0, 10)}.json`;
}
