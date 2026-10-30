import type { GQLIssueFilter, GQLIssuePriority, GQLIssueStatus, GQLIssueType, GQLIssueView } from "@src/graphql.generated";
import { type Pagination, parsePagination, writePagination } from "@src/util/pagination";
import { parseSearch } from "@src/util/search";

import { issuePriorityOptions, issueStatusOptions, issueTypeOptions } from "./issueOptions";
import { isIssueView, OPEN_ISSUE_STATUSES } from "./issueViews";

// Without a status in the URL the list shows what still needs to be done
const DEFAULT_STATUSES: GQLIssueStatus[] = ["todo", "inProgress"];
// Stands for "no status filter" in the URL, which an empty status param could not tell apart from the default
const ALL_STATUSES = "all";

// The filters of the issue list live in the search params, so a filtered list can be bookmarked and shared.
// Each list matches any of its values; an empty list does not filter.
export interface IssueListParams extends Pagination {
    // The tab of the issue list, which the filters narrow down; no filter itself, so "Reset" keeps it
    view?: GQLIssueView;
    statuses: GQLIssueStatus[];
    types: GQLIssueType[];
    priorities: GQLIssuePriority[];
    epics: string[];
    labels: string[];
    search?: string;
}

type SearchParams = Record<string, string | string[] | undefined>;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function readParam(searchParams: SearchParams, name: string): string | undefined {
    const value = searchParams[name];
    return Array.isArray(value) ? value[0] : value;
}

// "id,id" becomes the IDs among them, e.g. of epics or labels
function readIds(searchParams: SearchParams, name: string): string[] {
    return (readParam(searchParams, name)?.split(",") ?? []).filter((id) => UUID_PATTERN.test(id));
}

// "todo,done" becomes the known values among them, in the order of the options
function readList<Value extends string>(searchParams: SearchParams, name: string, values: Value[]): Value[] {
    const requested = readParam(searchParams, name)?.split(",") ?? [];
    return values.filter((value) => requested.includes(value));
}

function readStatuses(searchParams: SearchParams): GQLIssueStatus[] {
    const status = readParam(searchParams, "status");
    if (status === undefined) {
        return DEFAULT_STATUSES;
    }
    if (status === ALL_STATUSES) {
        return [];
    }
    const statuses = readList(
        searchParams,
        "status",
        issueStatusOptions.map(({ value }) => value),
    );
    return statuses.length > 0 ? statuses : DEFAULT_STATUSES;
}

export function parseIssueListParams(searchParams: SearchParams): IssueListParams {
    const requestedView = readParam(searchParams, "view");
    const view = isIssueView(requestedView) ? requestedView : undefined;
    return {
        ...(view && { view }),
        statuses: view ? openStatusesAmong(readStatuses(searchParams)) : readStatuses(searchParams),
        types: readList(
            searchParams,
            "type",
            issueTypeOptions.map(({ value }) => value),
        ),
        priorities: readList(
            searchParams,
            "priority",
            issuePriorityOptions.map(({ value }) => value),
        ),
        epics: readIds(searchParams, "epic"),
        labels: readIds(searchParams, "label"),
        search: parseSearch(searchParams),
        ...parsePagination(searchParams),
    };
}

// A view shows open issues only, so its status filter can only pick among them
export function openStatusesAmong(statuses: GQLIssueStatus[]): GQLIssueStatus[] {
    const openStatuses = statuses.filter((status) => OPEN_ISSUE_STATUSES.includes(status));
    return openStatuses.length > 0 ? openStatuses : DEFAULT_STATUSES;
}

// The params of another tab, which keeps search, filters and page size and starts on the first page
export function withView(params: IssueListParams, view?: GQLIssueView): IssueListParams {
    return { ...params, view, statuses: view ? openStatusesAmong(params.statuses) : params.statuses, page: 1 };
}

function hasDefaultStatuses(statuses: GQLIssueStatus[]): boolean {
    return statuses.length === DEFAULT_STATUSES.length && DEFAULT_STATUSES.every((status) => statuses.includes(status));
}

// Whether anything differs from the plain list of open issues; the page size is no filter
export function isIssueListFiltered({ statuses, types, priorities, epics, labels, search, page }: IssueListParams): boolean {
    return (
        !hasDefaultStatuses(statuses) ||
        types.length > 0 ||
        priorities.length > 0 ||
        epics.length > 0 ||
        labels.length > 0 ||
        Boolean(search) ||
        page > 1
    );
}

export function toIssueFilter({ statuses, types, priorities, epics, labels, search }: IssueListParams): GQLIssueFilter {
    const listOrNull = <Value>(values: Value[]) => (values.length > 0 ? values : null);

    return {
        statuses: listOrNull(statuses),
        types: listOrNull(types),
        priorities: listOrNull(priorities),
        epicIds: listOrNull(epics),
        labelIds: listOrNull(labels),
        search: search ?? null,
    };
}

// Leaves out the defaults, so the plain list keeps its plain URL
export function issueListHref(path: string, { view, statuses, types, priorities, epics, labels, search, ...pagination }: IssueListParams): string {
    const searchParams = new URLSearchParams();
    if (view) {
        searchParams.set("view", view);
    }
    if (!hasDefaultStatuses(statuses)) {
        searchParams.set("status", statuses.length > 0 ? statuses.join(",") : ALL_STATUSES);
    }
    for (const [name, values] of [
        ["type", types],
        ["priority", priorities],
        ["epic", epics],
        ["label", labels],
    ] as const) {
        if (values.length > 0) {
            searchParams.set(name, values.join(","));
        }
    }
    if (search) {
        searchParams.set("search", search);
    }
    writePagination(searchParams, pagination);

    // Commas separate the values of a list, they need no escaping
    const query = searchParams.toString().replaceAll("%2C", ",");
    return query ? `${path}?${query}` : path;
}
