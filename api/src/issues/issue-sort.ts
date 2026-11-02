import type { QueryOrderMap } from "@mikro-orm/postgresql";
import { InputType, registerEnumType } from "@nestjs/graphql";
import { rankOf, Sort, SortDirection } from "@src/common/sort.js";

import { type Issue, IssuePriority } from "./entities/issue.entity.js";
import { IssueView } from "./issue-views.js";

export enum IssueSortField {
    createdAt = "createdAt",
    updatedAt = "updatedAt",
    priority = "priority",
    dueDate = "dueDate",
    title = "title",
}
registerEnumType(IssueSortField, {
    name: "IssueSortField",
    valuesMap: {
        priority: { description: "From low to high, so descending puts high first" },
        dueDate: { description: "Issues without a due date come last in both directions" },
    },
});

@InputType()
export class IssueSort extends Sort(IssueSortField) {}

// The direction a field is sorted in when only the field is given, e.g. by MCP: what a person expects on top
export const DEFAULT_ISSUE_SORT_DIRECTIONS: Record<IssueSortField, SortDirection> = {
    [IssueSortField.createdAt]: SortDirection.desc,
    [IssueSortField.updatedAt]: SortDirection.desc,
    [IssueSortField.priority]: SortDirection.desc,
    [IssueSortField.dueDate]: SortDirection.asc,
    [IssueSortField.title]: SortDirection.asc,
};

const PRIORITIES_FROM_LOW_TO_HIGH = [IssuePriority.low, IssuePriority.normal, IssuePriority.high];

interface IssueOrderOptions {
    sort?: IssueSort;
    view?: IssueView;
    // The numbers only count up within a project, across projects the creation time and the ID decide
    isWithinProject: boolean;
}

// Without a sort newest first, the view of due issues the soonest due first. Issues that are equal in the sorted field stay newest first.
export function issueOrder({ sort, view, isWithinProject }: IssueOrderOptions): QueryOrderMap<Issue>[] {
    const creationOrder = (direction: SortDirection): QueryOrderMap<Issue> =>
        isWithinProject ? { number: direction } : { createdAt: direction, id: direction };
    const newestFirst = creationOrder(SortDirection.desc);

    if (!sort) {
        return view === IssueView.due ? [{ dueDate: "asc" }, newestFirst] : [newestFirst];
    }
    const { field, direction } = sort;
    switch (field) {
        case IssueSortField.createdAt:
            return [creationOrder(direction)];
        case IssueSortField.priority:
            return [{ [rankOf("priority", PRIORITIES_FROM_LOW_TO_HIGH)]: direction }, newestFirst];
        case IssueSortField.dueDate:
            return [{ dueDate: `${direction} nulls last` }, newestFirst];
        case IssueSortField.updatedAt:
        case IssueSortField.title:
            return [{ [field]: direction }, newestFirst];
    }
}
