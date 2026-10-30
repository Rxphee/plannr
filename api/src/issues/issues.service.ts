import { EntityManager, type FilterQuery, LockMode, ref } from "@mikro-orm/postgresql";
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { containsPattern } from "@src/db/contains-pattern.js";
import { EpicsService } from "@src/epics/epics.service.js";
import { LabelsService } from "@src/labels/labels.service.js";
import { Project } from "@src/projects/entities/project.entity.js";
import { ProjectsService } from "@src/projects/projects.service.js";
import type { User } from "@src/users/user.entity.js";

import type { CreateIssueInput } from "./dto/create-issue.input.js";
import type { IssueLinkInput } from "./dto/issue-link.input.js";
import type { IssuesArgs } from "./dto/issues.args.js";
import type { PaginatedIssues } from "./dto/paginated-issues.js";
import type { UpdateIssueInput } from "./dto/update-issue.input.js";
import { Issue } from "./entities/issue.entity.js";
import { detectIssueLinkKind, IssueLink } from "./entities/issue-link.entity.js";
import { findIssueNumberIn, parseIssueKey } from "./issue-key.js";

@Injectable()
export class IssuesService {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly projectsService: ProjectsService,
        private readonly epicsService: EpicsService,
        private readonly labelsService: LabelsService,
    ) {}

    // Newest first
    async findAll({ projectId, filter = {}, offset, limit }: IssuesArgs, user: User): Promise<PaginatedIssues> {
        const project = await this.projectsService.findOneVisibleById(projectId, user);
        const { epicIds, statuses, types, priorities, labelIds, search } = filter;

        const where: FilterQuery<Issue> = { project };
        if (epicIds?.length) {
            where.epic = { $in: epicIds };
        }
        if (statuses?.length) {
            where.status = { $in: statuses };
        }
        if (types?.length) {
            where.type = { $in: types };
        }
        if (priorities?.length) {
            where.priority = { $in: priorities };
        }
        if (labelIds?.length) {
            where.labels = { $some: { id: { $in: labelIds } } };
        }
        if (search) {
            const number = findIssueNumberIn(search);
            where.$or = [{ title: { $ilike: containsPattern(search) } }, ...(number ? [{ number }] : [])];
        }

        const [nodes, totalCount] = await this.entityManager.findAndCount(Issue, where, {
            populate: ["epic", "links", "labels"],
            orderBy: { number: "desc" },
            offset,
            limit,
        });
        return { nodes, totalCount };
    }

    async findOneByKeyVisibleTo(key: string, user: User): Promise<Issue | null> {
        const issueKey = parseIssueKey(key);
        if (!issueKey) {
            return null;
        }
        const { projectKey, number } = issueKey;
        return this.entityManager.findOne(Issue, {
            number,
            project: user.isAdmin ? { key: projectKey } : { key: projectKey, members: { user } },
        });
    }

    async create({ projectId, epicId, labelIds, ...input }: CreateIssueInput, user: User): Promise<Issue> {
        return this.entityManager.transactional(async () => {
            const project = await this.projectsService.findOneVisibleById(projectId, user);
            await this.projectsService.assertCanContribute(project, user);
            const epic = epicId ? await this.epicsService.findOneInProject(epicId, project) : await this.epicsService.findDefault(project);
            const labels = await this.labelsService.findByIds(labelIds);

            // Locks the project until the transaction ends and reads its current counter, so two new issues never get the same number
            await this.entityManager.findOneOrFail(Project, project.id, { lockMode: LockMode.PESSIMISTIC_WRITE, refresh: true });
            project.issueCounter += 1;

            return this.entityManager.create(Issue, { ...input, project, epic, labels, number: project.issueCounter, createdBy: user });
        });
    }

    async update(id: string, { epicId, status, dueDate, labelIds, ...fields }: UpdateIssueInput, user: User): Promise<Issue> {
        const issue = await this.findOneContributableBy(id, user);

        // Fields that are not given stay as they are
        this.entityManager.assign(issue, Object.fromEntries(Object.entries(fields).filter(([, value]) => value !== undefined)));
        if (epicId) {
            issue.epic = ref(await this.epicsService.findOneInProject(epicId, await issue.project.loadOrFail()));
        }
        if (status) {
            issue.changeStatus(status);
        }
        if (dueDate !== undefined) {
            issue.dueDate = dueDate;
        }
        if (labelIds) {
            issue.labels.set(await this.labelsService.findByIds(labelIds));
        }

        await this.entityManager.flush();
        return issue;
    }

    // Members cancel an issue instead, so only owners and admins delete it
    async delete(id: string, user: User): Promise<void> {
        const issue = await this.findOneOrFail(id, user);
        if (!(await this.projectsService.canManage(await issue.project.loadOrFail(), user))) {
            throw new ForbiddenException("Only owners and admins can delete issues, cancel the issue instead");
        }
        await this.entityManager.remove(issue).flush();
    }

    async addLink({ issueId, url }: IssueLinkInput, user: User): Promise<IssueLink> {
        const issue = await this.findOneContributableBy(issueId, user);
        if ((await this.entityManager.count(IssueLink, { issue, url })) > 0) {
            throw new BadRequestException("The issue already has this link");
        }

        const link = this.entityManager.create(IssueLink, { issue, url, kind: detectIssueLinkKind(url) });
        await this.entityManager.flush();
        return link;
    }

    async removeLink(id: string, user: User): Promise<void> {
        const link = await this.entityManager.findOne(IssueLink, id);
        if (!link) {
            throw new NotFoundException("The link does not exist");
        }
        await this.findOneContributableBy(link.issue.id, user);
        await this.entityManager.remove(link).flush();
    }

    private async findOneOrFail(id: string, user: User): Promise<Issue> {
        const issue = await this.entityManager.findOne(Issue, user.isAdmin ? { id } : { id, project: { members: { user } } });
        if (!issue) {
            throw new NotFoundException("The issue does not exist");
        }
        return issue;
    }

    private async findOneContributableBy(id: string, user: User): Promise<Issue> {
        const issue = await this.findOneOrFail(id, user);
        await this.projectsService.assertCanContribute(await issue.project.loadOrFail(), user);
        return issue;
    }
}
