import type { FilterQuery } from "@mikro-orm/postgresql";
import { registerEnumType } from "@nestjs/graphql";
import type { User } from "@src/users/user.entity.js";

import { type Issue, IssuePriority, IssueStatus, IssueType } from "./entities/issue.entity.js";
import { IssueLinkKind } from "./entities/issue-link.entity.js";

// The fixed views of the issue list. Each one shows open issues only, the filters narrow it further.
export enum IssueView {
    focus = "focus",
    due = "due",
    bugs = "bugs",
    pullRequests = "pullRequests",
    assignedToMe = "assignedToMe",
}
registerEnumType(IssueView, {
    name: "IssueView",
    valuesMap: {
        focus: { description: "Open issues with priority high" },
        due: { description: "Open issues with a due date, the soonest first" },
        bugs: { description: "Open bugs" },
        pullRequests: { description: "Open issues with a link to a pull request" },
        assignedToMe: { description: "Open issues assigned to the current user" },
    },
});

const OPEN_ISSUE_STATUSES = [IssueStatus.todo, IssueStatus.inProgress];

const viewConditions: Record<IssueView, (user: User) => FilterQuery<Issue>> = {
    [IssueView.focus]: () => ({ priority: IssuePriority.high }),
    [IssueView.due]: () => ({ dueDate: { $ne: null } }),
    [IssueView.bugs]: () => ({ type: IssueType.bug }),
    [IssueView.pullRequests]: () => ({ links: { $some: { kind: IssueLinkKind.pullRequest } } }),
    [IssueView.assignedToMe]: (user) => ({ assignee: user.id }),
};

export function issueViewCondition(view: IssueView, user: User): FilterQuery<Issue> {
    return { $and: [{ status: { $in: OPEN_ISSUE_STATUSES } }, viewConditions[view](user)] };
}
