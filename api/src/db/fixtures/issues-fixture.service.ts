import { Injectable } from "@nestjs/common";
import type { Epic } from "@src/epics/entities/epic.entity.js";
import { type Issue, IssuePriority, IssueStatus, IssueType } from "@src/issues/entities/issue.entity.js";
import { IssuesService } from "@src/issues/issues.service.js";
import type { Label } from "@src/labels/entities/label.entity.js";
import type { User } from "@src/users/user.entity.js";

import type { FixtureEpics } from "./epics-fixture.service.js";
import type { FixtureLabels } from "./labels-fixture.service.js";
import type { FixtureUsers } from "./users-fixture.service.js";

interface FixtureIssue {
    epic: Epic;
    title: string;
    type?: IssueType;
    status?: IssueStatus;
    priority?: IssuePriority;
    // Relative to today, negative for overdue issues
    dueInDays?: number;
    description?: string;
    labels?: Label[];
    links?: string[];
}

const websitePages = ["Home", "About", "Services", "Case studies", "Team", "Careers", "Blog", "Pricing", "Contact", "Imprint", "Privacy", "FAQ"];
const statusCycle = [IssueStatus.done, IssueStatus.done, IssueStatus.inProgress, IssueStatus.todo, IssueStatus.todo, IssueStatus.canceled];
const priorityCycle = [IssuePriority.normal, IssuePriority.normal, IssuePriority.high, IssuePriority.low];

function daysFromToday(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString().slice(0, 10);
}

@Injectable()
export class IssuesFixtureService {
    constructor(private readonly issuesService: IssuesService) {}

    async generateIssues(epics: FixtureEpics, { developmentUser, team }: FixtureUsers, labels: FixtureLabels): Promise<void> {
        const { design, content, launch, general } = epics.website;

        // Enough issues for more than one page of the issue list
        const pageIssues = websitePages.flatMap((page, index): FixtureIssue[] => [
            { epic: design, title: `Design the ${page} page`, status: statusCycle[index % statusCycle.length], labels: [labels.design] },
            {
                epic: content,
                title: `Write the copy for the ${page} page`,
                priority: priorityCycle[index % priorityCycle.length],
                labels: [labels.customer],
            },
            { epic: content, title: `Review the ${page} page with marketing`, status: index < 4 ? IssueStatus.done : IssueStatus.todo },
            { epic: launch, title: `Set up redirects from the old ${page} page`, priority: IssuePriority.low },
        ]);

        const websiteIssues: FixtureIssue[] = [
            ...pageIssues,
            {
                epic: design,
                title: "Define the color palette and typography",
                status: IssueStatus.done,
                labels: [labels.design, labels.documentation],
                description: "Colors and fonts for the design system.\n\n- [x] Primary and neutral colors\n- [x] Font pairing\n- [ ] Dark mode",
                links: ["https://github.com/Rxphee/plannr/pull/11"],
            },
            {
                epic: design,
                title: "Navigation collapses too late on tablets",
                type: IssueType.bug,
                status: IssueStatus.inProgress,
                priority: IssuePriority.high,
                dueInDays: 2,
                labels: [labels.frontend, labels.upstream],
                description:
                    "Between 768 and 900 pixels the menu items wrap into two lines.\n\n**Steps**\n\n1. Open the home page on an iPad in portrait\n2. Look at the header",
                links: ["https://github.com/Rxphee/plannr/pull/12", "obsidian://open?vault=SecondBrain&file=Website%20Relaunch"],
            },
            { epic: content, title: "Collect photos of the team", dueInDays: -3, priority: IssuePriority.high },
            {
                epic: content,
                title: "Contact form sends no confirmation mail",
                type: IssueType.bug,
                dueInDays: -1,
                priority: IssuePriority.high,
                labels: [labels.backend, labels.customer],
            },
            { epic: launch, title: "Plan the launch date with the client", priority: IssuePriority.high, dueInDays: 14 },
            { epic: launch, title: "Move the DNS records to the new server", dueInDays: 21 },
            { epic: general, title: "Ask for the new logo files" },
            { epic: general, title: "Footer links point to the staging site", type: IssueType.bug, labels: [labels.frontend] },
        ];
        await this.createIssues(websiteIssues, [developmentUser, team[0], team[1], team[2]]);

        const { offline, onboarding } = epics.app;
        await this.createIssues(
            [
                {
                    epic: offline,
                    title: "Store changes locally while offline",
                    status: IssueStatus.inProgress,
                    description: "Use a local queue and send it once the app is online again.",
                },
                { epic: offline, title: "Resolve conflicts after syncing", priority: IssuePriority.high },
                {
                    epic: offline,
                    title: "App crashes when the connection drops during upload",
                    type: IssueType.bug,
                    priority: IssuePriority.high,
                    labels: [labels.upstream],
                },
                { epic: onboarding, title: "Write the welcome screens", status: IssueStatus.done },
                { epic: onboarding, title: "Ask for notification permission at the right moment" },
            ],
            [developmentUser],
        );

        await this.createIssues([{ epic: epics.holiday.general, title: "Book the hotel", status: IssueStatus.done }], [developmentUser]);
    }

    // The authors take turns, so the issues are not all from the same person
    private async createIssues(issues: FixtureIssue[], authors: User[]): Promise<void> {
        for (const [index, fixtureIssue] of issues.entries()) {
            await this.createIssue(fixtureIssue, authors[index % authors.length]);
        }
    }

    private async createIssue(
        {
            epic,
            title,
            type = IssueType.task,
            status,
            priority = IssuePriority.normal,
            dueInDays,
            description = "",
            labels = [],
            links = [],
        }: FixtureIssue,
        user: User,
    ): Promise<Issue> {
        const issue = await this.issuesService.create(
            {
                projectId: epic.project.id,
                epicId: epic.id,
                title,
                type,
                priority,
                dueDate: dueInDays === undefined ? null : daysFromToday(dueInDays),
                description,
                labelIds: labels.map((label) => label.id),
            },
            user,
        );
        if (status) {
            await this.issuesService.update(issue.id, { status }, user);
        }
        for (const url of links) {
            await this.issuesService.addLink({ issueId: issue.id, url }, user);
        }
        return issue;
    }
}
