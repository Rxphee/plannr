import { validateSync } from "class-validator";
import { describe, expect, it } from "vitest";

import { Project, ProjectStatus } from "./project.entity.js";

function createProject(data: Partial<Project> = {}): Project {
    return Object.assign(new Project(), { key: "PLAN", name: "Plannr" }, data);
}

describe("Project", () => {
    it("accepts a valid project", () => {
        expect(validateSync(createProject())).toEqual([]);
    });

    it.each([
        ["key", { key: "plan" }],
        ["name", { name: "" }],
        ["name", { name: "a".repeat(51) }],
        ["description", { description: 42 as unknown as string }],
        ["status", { status: "deleted" as ProjectStatus }],
        ["issueCounter", { issueCounter: -1 }],
    ])("rejects an invalid %s", (property, data) => {
        expect(validateSync(createProject(data)).map((error) => error.property)).toEqual([property]);
    });

    it("accepts an archived project", () => {
        expect(validateSync(createProject({ status: ProjectStatus.archived, archivedAt: new Date() }))).toEqual([]);
    });
});
