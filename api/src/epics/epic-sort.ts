import type { QueryOrderMap } from "@mikro-orm/postgresql";
import { InputType, registerEnumType } from "@nestjs/graphql";
import { Sort, SortDirection } from "@src/common/sort.js";

import type { Epic } from "./entities/epic.entity.js";

export enum EpicSortField {
    name = "name",
    createdAt = "createdAt",
    updatedAt = "updatedAt",
}
registerEnumType(EpicSortField, { name: "EpicSortField" });

@InputType()
export class EpicSort extends Sort(EpicSortField) {}

// The direction a field is sorted in when only the field is given, e.g. by MCP
export const DEFAULT_EPIC_SORT_DIRECTIONS: Record<EpicSortField, SortDirection> = {
    [EpicSortField.name]: SortDirection.asc,
    [EpicSortField.createdAt]: SortDirection.desc,
    [EpicSortField.updatedAt]: SortDirection.desc,
};

// General always first, since it collects everything without an epic. Then by name without a sort, and by name and ID within the sorted field,
// so that two epics with the same name keep their order across pages.
export function epicOrder(sort?: EpicSort): QueryOrderMap<Epic>[] {
    const byName: QueryOrderMap<Epic> = { name: "asc", id: "asc" };
    if (!sort) {
        return [{ isDefault: "desc" }, byName];
    }
    return [{ isDefault: "desc" }, { [sort.field]: sort.direction }, byName];
}
