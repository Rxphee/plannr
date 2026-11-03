import type { Ref } from "@mikro-orm/postgresql";
import { Epic } from "@src/epics/entities/epic.entity.js";
import { Image } from "@src/images/entities/image.entity.js";
import { Issue, IssuePriority, IssueStatus, IssueType } from "@src/issues/entities/issue.entity.js";
import { IssueLink, IssueLinkKind } from "@src/issues/entities/issue-link.entity.js";
import { Label, LabelColor } from "@src/labels/entities/label.entity.js";
import { Project, ProjectStatus } from "@src/projects/entities/project.entity.js";
import { ProjectMember, ProjectMemberRole } from "@src/projects/entities/project-member.entity.js";
import { User } from "@src/users/user.entity.js";
import { describe, expect, it } from "vitest";

import { buildProjectExport, imageFileName, PROJECT_EXPORT_VERSION, projectExportFileName } from "./project-export-format.js";

// A loaded reference as the queries of the export return them
function loaded<Entity extends { id: string }>(entity: Entity): Ref<Entity> {
    return { id: entity.id, getEntity: () => entity } as unknown as Ref<Entity>;
}

const createdAt = new Date("2026-10-29T08:00:00Z");
const updatedAt = new Date("2026-10-30T09:00:00Z");
const exportedAt = new Date("2026-11-03T22:30:00Z");

const max = Object.assign(new User(), { id: "max-id", email: "max@example.com", firstName: "Max", lastName: "Mustermann" });
const erika = Object.assign(new User(), { id: "erika-id", email: "erika@example.com", firstName: "Erika", lastName: "Mustermann" });
const lukas = Object.assign(new User(), { id: "lukas-id", email: "lukas@example.com", firstName: "Lukas", lastName: "Berger" });

const project = Object.assign(new Project(), {
    id: "project-id",
    key: "WEB",
    name: "Website Relaunch",
    description: "The new **website**",
    status: ProjectStatus.active,
    createdBy: loaded(max),
    createdAt,
    updatedAt,
});
const general = Object.assign(new Epic(), { id: "general-id", name: "General", isDefault: true, createdAt, updatedAt });
const navigation = Object.assign(new Epic(), { id: "navigation-id", name: "Navigation", description: "Menus", createdAt, updatedAt });
const upstream = Object.assign(new Label(), { id: "upstream-id", name: "upstream", color: LabelColor.red });
const frontend = Object.assign(new Label(), { id: "frontend-id", name: "frontend", color: LabelColor.blue });

function createIssue(data: Partial<Omit<Issue, "labels" | "links">> & { labels?: Label[]; links?: IssueLink[] }): Issue {
    const { labels = [], links = [], ...fields } = data;
    return Object.assign(new Issue(), {
        epic: loaded(general),
        createdBy: loaded(max),
        createdAt,
        updatedAt,
        ...fields,
        labels: { getItems: () => labels } as unknown as Issue["labels"],
        links: { getItems: () => links } as unknown as Issue["links"],
    });
}

function exportOf(issues: Issue[], images: Image[] = []) {
    const members = [Object.assign(new ProjectMember(), { user: loaded(max), role: ProjectMemberRole.owner, createdAt })];
    return buildProjectExport({ project, members, epics: [general, navigation], issues, images, exportedAt });
}

describe("buildProjectExport", () => {
    it("exports the project with its members and epics", () => {
        const projectExport = exportOf([]);

        expect(projectExport).toMatchObject({
            version: PROJECT_EXPORT_VERSION,
            exportedAt,
            project: {
                id: "project-id",
                key: "WEB",
                name: "Website Relaunch",
                description: "The new **website**",
                status: ProjectStatus.active,
                createdBy: "max@example.com",
                archivedAt: null,
                members: [{ user: "max@example.com", role: ProjectMemberRole.owner, createdAt }],
                epics: [
                    { id: "general-id", name: "General", description: "", isDefault: true, issues: [] },
                    { id: "navigation-id", name: "Navigation", description: "Menus", isDefault: false, issues: [] },
                ],
            },
            images: [],
            users: [{ email: "max@example.com", firstName: "Max", lastName: "Mustermann" }],
            labels: [],
        });
    });

    it("puts every issue into its epic with key, labels, links and people", () => {
        const link = Object.assign(new IssueLink(), {
            url: "https://github.com/Rxphee/plannr/pull/1",
            kind: IssueLinkKind.pullRequest,
            createdAt,
        });
        const bug = createIssue({
            id: "bug-id",
            number: 2,
            title: "Menu does not close",
            type: IssueType.bug,
            status: IssueStatus.done,
            priority: IssuePriority.high,
            dueDate: "2026-11-10",
            description: "- [ ] Check Safari",
            epic: loaded(navigation),
            assignee: loaded(erika),
            completedAt: updatedAt,
            labels: [upstream, frontend],
            links: [link],
        });
        const task = createIssue({ id: "task-id", number: 1, title: "Set up the repository" });

        const projectExport = exportOf([task, bug]);

        expect(projectExport.project.epics[0].issues.map(({ key }) => key)).toEqual(["WEB-1"]);
        expect(projectExport.project.epics[1].issues).toEqual([
            {
                id: "bug-id",
                key: "WEB-2",
                number: 2,
                title: "Menu does not close",
                type: IssueType.bug,
                status: IssueStatus.done,
                priority: IssuePriority.high,
                dueDate: "2026-11-10",
                description: "- [ ] Check Safari",
                labels: ["upstream", "frontend"],
                links: [{ url: "https://github.com/Rxphee/plannr/pull/1", kind: IssueLinkKind.pullRequest, createdAt }],
                assignee: "erika@example.com",
                createdBy: "max@example.com",
                createdAt,
                updatedAt,
                completedAt: updatedAt,
            },
        ]);
    });

    it("lists each user and label it refers to once, sorted", () => {
        const projectExport = exportOf([
            createIssue({ number: 1, title: "First", assignee: loaded(erika), labels: [upstream] }),
            createIssue({ number: 2, title: "Second", createdBy: loaded(lukas), assignee: loaded(erika), labels: [upstream, frontend] }),
        ]);

        expect(projectExport.users.map(({ email }) => email)).toEqual(["erika@example.com", "lukas@example.com", "max@example.com"]);
        expect(projectExport.labels).toEqual([
            { name: "frontend", color: LabelColor.blue },
            { name: "upstream", color: LabelColor.red },
        ]);
    });

    it("lists the images with their file in the archive and their uploader", () => {
        const image = Object.assign(new Image(), {
            id: "1c349463-21ff-4e83-9119-af96198d3bc7",
            contentType: "image/png" as const,
            size: 2048,
            uploadedBy: loaded(lukas),
            createdAt,
        });

        const projectExport = exportOf([], [image]);

        expect(projectExport.images).toEqual([
            {
                id: "1c349463-21ff-4e83-9119-af96198d3bc7",
                file: "images/1c349463-21ff-4e83-9119-af96198d3bc7.png",
                contentType: "image/png",
                size: 2048,
                uploadedBy: "lukas@example.com",
                createdAt,
            },
        ]);
        expect(projectExport.users.map(({ email }) => email)).toContain("lukas@example.com");
    });
});

describe("imageFileName", () => {
    it("takes the extension from the type", () => {
        expect(imageFileName({ id: "abc", contentType: "image/jpeg" })).toBe("images/abc.jpg");
    });
});

describe("projectExportFileName", () => {
    it("names the archive after the key and the day of the export in UTC", () => {
        expect(projectExportFileName(exportOf([]))).toBe("plannr-WEB-2026-11-03.zip");
    });
});
