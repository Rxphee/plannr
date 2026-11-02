import type { QueryOrderMap } from "@mikro-orm/postgresql";
import { InputType, registerEnumType } from "@nestjs/graphql";
import { Sort, SortDirection } from "@src/common/sort.js";

import type { Project } from "./entities/project.entity.js";

export enum ProjectSortField {
    name = "name",
    key = "key",
    createdAt = "createdAt",
    updatedAt = "updatedAt",
}
registerEnumType(ProjectSortField, { name: "ProjectSortField" });

@InputType()
export class ProjectSort extends Sort(ProjectSortField) {}

// The direction a field is sorted in when only the field is given, e.g. by MCP
export const DEFAULT_PROJECT_SORT_DIRECTIONS: Record<ProjectSortField, SortDirection> = {
    [ProjectSortField.name]: SortDirection.asc,
    [ProjectSortField.key]: SortDirection.asc,
    [ProjectSortField.createdAt]: SortDirection.desc,
    [ProjectSortField.updatedAt]: SortDirection.desc,
};

// By name without a sort. The ID comes last, so that two projects with the same value keep their order across pages.
export function projectOrder(
    { field, direction }: ProjectSort = { field: ProjectSortField.name, direction: SortDirection.asc },
): QueryOrderMap<Project>[] {
    return [{ [field]: direction }, { id: "asc" }];
}
