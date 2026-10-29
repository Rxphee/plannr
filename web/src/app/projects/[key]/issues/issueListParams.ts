import type { GQLIssueFilter, GQLIssuePriority, GQLIssueStatus, GQLIssueType } from "@src/graphql.generated";

import { issuePriorityOptions, issueStatusOptions, issueTypeOptions } from "./issueOptions";

export const ISSUES_PAGE_SIZE = 50;

// "open" is the default view: what still needs to be done
export type IssueStatusView = "open" | "all" | GQLIssueStatus;

// The filters of the issue list live in the search params, so a filtered list can be bookmarked and shared
export interface IssueListParams {
    status: IssueStatusView;
    type?: GQLIssueType;
    priority?: GQLIssuePriority;
    epic?: string;
    search?: string;
    page: number;
}

type SearchParams = Record<string, string | string[] | undefined>;

const statusViews: IssueStatusView[] = ["open", "all", ...issueStatusOptions.map(({ value }) => value)];
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readParam(searchParams: SearchParams, name: string): string | undefined {
    const value = searchParams[name];
    return Array.isArray(value) ? value[0] : value;
}

function oneOf<Value extends string>(value: string | undefined, values: Value[]): Value | undefined {
    return values.find((candidate) => candidate === value);
}

export function parseIssueListParams(searchParams: SearchParams): IssueListParams {
    const epic = readParam(searchParams, "epic");
    const page = Number(readParam(searchParams, "page"));

    return {
        status: oneOf(readParam(searchParams, "status"), statusViews) ?? "open",
        type: oneOf(
            readParam(searchParams, "type"),
            issueTypeOptions.map(({ value }) => value),
        ),
        priority: oneOf(
            readParam(searchParams, "priority"),
            issuePriorityOptions.map(({ value }) => value),
        ),
        epic: epic && UUID_PATTERN.test(epic) ? epic : undefined,
        search: readParam(searchParams, "search")?.trim() || undefined,
        page: Number.isInteger(page) && page > 1 ? page : 1,
    };
}

export function toIssueFilter({ status, type, priority, epic, search }: IssueListParams): GQLIssueFilter {
    const statusesByView: Record<IssueStatusView, GQLIssueStatus[] | null> = {
        open: ["todo", "inProgress"],
        all: null,
        todo: ["todo"],
        inProgress: ["inProgress"],
        done: ["done"],
        canceled: ["canceled"],
    };

    return { statuses: statusesByView[status], type: type ?? null, priority: priority ?? null, epicId: epic ?? null, search: search ?? null };
}

// Leaves out the defaults, so the plain list keeps its plain URL
export function issueListHref(path: string, { status, type, priority, epic, search, page }: IssueListParams): string {
    const searchParams = new URLSearchParams();
    if (status !== "open") {
        searchParams.set("status", status);
    }
    if (type) {
        searchParams.set("type", type);
    }
    if (priority) {
        searchParams.set("priority", priority);
    }
    if (epic) {
        searchParams.set("epic", epic);
    }
    if (search) {
        searchParams.set("search", search);
    }
    if (page > 1) {
        searchParams.set("page", String(page));
    }

    const query = searchParams.toString();
    return query ? `${path}?${query}` : path;
}
