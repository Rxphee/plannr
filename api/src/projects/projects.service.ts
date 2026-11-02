import { EntityManager, type FilterQuery, LockMode, UniqueConstraintViolationException } from "@mikro-orm/postgresql";
import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { UserError } from "@src/common/user-error.js";
import { containsPattern } from "@src/db/contains-pattern.js";
import { Epic } from "@src/epics/entities/epic.entity.js";
import { DEFAULT_EPIC_NAME } from "@src/epics/epic-constraints.js";
import { InstanceRolesService } from "@src/instance-roles/instance-roles.service.js";
import { Issue } from "@src/issues/entities/issue.entity.js";
import { User } from "@src/users/user.entity.js";

import type { AddProjectMembersInput } from "./dto/add-project-members.input.js";
import type { CreateProjectInput } from "./dto/create-project.input.js";
import type { PaginatedProjectMembers } from "./dto/paginated-project-members.js";
import type { PaginatedProjects } from "./dto/paginated-projects.js";
import type { ProjectMemberInput } from "./dto/project-member.input.js";
import type { ProjectMembersArgs } from "./dto/project-members.args.js";
import type { ProjectsArgs } from "./dto/projects.args.js";
import type { UpdateProjectInput } from "./dto/update-project.input.js";
import { Project, ProjectStatus } from "./entities/project.entity.js";
import { ProjectMember, ProjectMemberRole } from "./entities/project-member.entity.js";
import { projectOrder } from "./project-sort.js";

@Injectable()
export class ProjectsService {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly instanceRoles: InstanceRolesService,
    ) {}

    async findAllVisibleTo({ statuses, search, sort, offset, limit }: ProjectsArgs, user: User): Promise<PaginatedProjects> {
        const where: FilterQuery<Project> = this.instanceRoles.hasAdminRights(user) ? {} : { members: { user } };
        if (statuses?.length) {
            where.status = { $in: statuses };
        }
        if (search) {
            where.$or = [{ name: { $ilike: containsPattern(search) } }, { key: { $ilike: containsPattern(search) } }];
        }
        const [nodes, totalCount] = await this.entityManager.findAndCount(Project, where, {
            orderBy: projectOrder(sort),
            offset,
            limit,
        });
        return { nodes, totalCount };
    }

    async findOneVisibleTo(key: string, user: User): Promise<Project | null> {
        return this.entityManager.findOne(Project, this.instanceRoles.hasAdminRights(user) ? { key } : { key, members: { user } });
    }

    async findOneVisibleById(id: string, user: User): Promise<Project> {
        const project = await this.entityManager.findOne(Project, this.instanceRoles.hasAdminRights(user) ? { id } : { id, members: { user } });
        if (!project) {
            throw new NotFoundException("The project does not exist");
        }
        return project;
    }

    // Sorted by name, then by ID, so that two members with the same name keep their order across pages
    async findMembers(project: Project, { search, offset, limit }: ProjectMembersArgs): Promise<PaginatedProjectMembers> {
        // Each word on its own, so "Anna Pichler" finds the member although first and last name are separate columns
        const wordConditions = (search?.split(/\s+/) ?? []).map((word): FilterQuery<ProjectMember> => {
            const pattern = containsPattern(word);
            return {
                $or: [
                    { user: { firstName: { $ilike: pattern } } },
                    { user: { lastName: { $ilike: pattern } } },
                    { user: { email: { $ilike: pattern } } },
                ],
            };
        });
        const [nodes, totalCount] = await this.entityManager.findAndCount(
            ProjectMember,
            { $and: [{ project }, ...wordConditions] },
            {
                populate: ["user"],
                orderBy: { user: { firstName: "asc", lastName: "asc", id: "asc" } },
                offset,
                limit,
            },
        );
        return { nodes, totalCount };
    }

    // Admins and the super-admin see and change every project through their instance role, so they need no membership
    async findAdminsWithoutMembership(project: Project): Promise<User[]> {
        const admins = await this.entityManager.find(User, this.instanceRoles.usersWithAdminRights(), {
            orderBy: { firstName: "asc", lastName: "asc", id: "asc" },
        });
        const memberships = await this.entityManager.find(ProjectMember, { project, user: { $in: admins } });
        const memberIds = new Set(memberships.map((membership) => membership.user.id));
        return admins.filter((admin) => !memberIds.has(admin.id));
    }

    // Who an issue of the project can be assigned to: its members and the admins without membership, who become members on their first assignment
    async findAssignableUsers(project: Project): Promise<User[]> {
        const memberships = await this.entityManager.find(ProjectMember, { project }, { populate: ["user"] });
        const users = [...memberships.map((membership) => membership.user.getEntity()), ...(await this.findAdminsWithoutMembership(project))];
        return users.sort(
            (first, second) =>
                first.firstName.localeCompare(second.firstName) || first.lastName.localeCompare(second.lastName) || first.id.localeCompare(second.id),
        );
    }

    // All issues of the project assigned to the member, done and canceled ones included, since removing the member unassigns them all
    async countAssignedIssues(member: ProjectMember): Promise<number> {
        return this.entityManager.count(Issue, { project: member.project, assignee: member.user });
    }

    // The assignee of an issue must be a member, so they keep seeing the issue. An admin without membership becomes a member,
    // so the issue stays visible to them once their admin rights end.
    async prepareAssignee(project: Project, userId: string): Promise<User> {
        const membership = await this.entityManager.findOne(ProjectMember, { project, user: userId }, { populate: ["user"] });
        if (membership) {
            return membership.user.getEntity();
        }
        const user = await this.entityManager.findOne(User, userId);
        if (!user || !this.instanceRoles.hasAdminRights(user)) {
            throw new UserError("assigneeNotAMember", "Only members of the project can be assigned");
        }
        this.entityManager.create(ProjectMember, { project, user, role: ProjectMemberRole.member });
        return user;
    }

    // Settings, status, deletion and members are up to the owners of a project and the admins
    async canManage(project: Project, user: User): Promise<boolean> {
        if (this.instanceRoles.hasAdminRights(user)) {
            return true;
        }
        return (await this.findRole(project, user)) === ProjectMemberRole.owner;
    }

    // Owners, members and admins create and edit epics and issues, viewers only read them.
    // Archived projects are read-only for everyone until an owner or admin sets them back to active.
    async canContribute(project: Project, user: User): Promise<boolean> {
        if (project.status === ProjectStatus.archived) {
            return false;
        }
        if (this.instanceRoles.hasAdminRights(user)) {
            return true;
        }
        const role = await this.findRole(project, user);
        return role === ProjectMemberRole.owner || role === ProjectMemberRole.member;
    }

    // Every change to the epics and issues of a project goes through here, deleting them needs canManage on top
    async assertCanContribute(project: Project, user: User): Promise<void> {
        if (await this.canContribute(project, user)) {
            return;
        }
        if (project.status === ProjectStatus.archived) {
            throw new ForbiddenException("The project is archived. Set it back to active to change it");
        }
        throw new ForbiddenException("Viewers can only read the epics and issues of the project");
    }

    async create(input: CreateProjectInput, user: User): Promise<Project> {
        const project = this.entityManager.create(Project, { ...input, createdBy: user });
        this.entityManager.create(ProjectMember, { project, user, role: ProjectMemberRole.owner });
        this.entityManager.create(Epic, { project, name: DEFAULT_EPIC_NAME, isDefault: true });

        try {
            await this.entityManager.flush();
        } catch (error) {
            if (error instanceof UniqueConstraintViolationException) {
                throw new UserError("projectKeyTaken", `The key ${input.key} is already taken by another project`, { key: input.key });
            }
            throw error;
        }
        return project;
    }

    async update(id: string, input: UpdateProjectInput, user: User): Promise<Project> {
        const project = await this.findOneManageableBy(id, user);
        this.entityManager.assign(project, input);
        await this.entityManager.flush();
        return project;
    }

    async changeStatus(id: string, status: ProjectStatus, user: User): Promise<Project> {
        const project = await this.findOneManageableBy(id, user);
        if (project.status !== status) {
            project.status = status;
            project.archivedAt = status === ProjectStatus.archived ? new Date() : null;
            await this.entityManager.flush();
        }
        return project;
    }

    // Deletes the project with everything in it, so only archived projects can be deleted
    async delete(id: string, user: User): Promise<void> {
        const project = await this.findOneManageableBy(id, user);
        if (project.status !== ProjectStatus.archived) {
            throw new UserError("projectNotArchived", "Only archived projects can be deleted");
        }
        await this.entityManager.remove(project).flush();
    }

    // All or none, so a failed request leaves the members as they were
    async addMembers({ projectId, userIds, role }: AddProjectMembersInput, user: User): Promise<ProjectMember[]> {
        return this.changeMembers(projectId, user, async (project) => {
            const newMembers = await this.entityManager.find(User, { id: { $in: userIds } });
            if (newMembers.length !== userIds.length) {
                throw new UserError("userNotFound", "A user does not exist");
            }
            const existingMemberships = await this.entityManager.find(ProjectMember, { project, user: { $in: userIds } });
            if (existingMemberships.length > 0) {
                const existingUserIds = new Set(existingMemberships.map((membership) => membership.user.id));
                const names = newMembers.filter(({ id }) => existingUserIds.has(id)).map(({ firstName, lastName }) => `${firstName} ${lastName}`);
                throw new UserError("alreadyMembers", `${names.join(", ")} ${names.length === 1 ? "is" : "are"} already a member of the project`, {
                    names,
                    count: names.length,
                });
            }
            return newMembers.map((newMember) => this.entityManager.create(ProjectMember, { project, user: newMember, role }));
        });
    }

    async changeMemberRole({ projectId, userId, role }: ProjectMemberInput, user: User): Promise<ProjectMember> {
        return this.changeMembers(projectId, user, async (project) => {
            const member = await this.findMember(project, userId);
            if (role !== ProjectMemberRole.owner) {
                await this.assertProjectKeepsAnOwner(project, member);
            }
            member.role = role;
            return member;
        });
    }

    async removeMember(projectId: string, userId: string, user: User): Promise<void> {
        await this.changeMembers(projectId, user, async (project) => {
            const member = await this.findMember(project, userId);
            await this.assertProjectKeepsAnOwner(project, member);
            this.entityManager.remove(member);
            // Only members can be assigned, so the issues of the former member lose their assignee
            await this.entityManager.nativeUpdate(Issue, { project, assignee: userId }, { assignee: null });
        });
    }

    private async findRole(project: Project, user: User): Promise<ProjectMemberRole | undefined> {
        const membership = await this.entityManager.findOne(ProjectMember, { project, user });
        return membership?.role;
    }

    private async findOneManageableBy(id: string, user: User): Promise<Project> {
        const project = await this.findOneVisibleById(id, user);
        if (!(await this.canManage(project, user))) {
            throw new ForbiddenException("Only owners and admins can manage the project");
        }
        return project;
    }

    // Runs the change in a transaction that locks the project, so two concurrent changes cannot take away its last owner.
    // Inside the transaction, this.entityManager resolves to the transaction's fork.
    private async changeMembers<Result>(projectId: string, user: User, change: (project: Project) => Promise<Result>): Promise<Result> {
        return this.entityManager.transactional(async () => {
            const project = await this.findOneManageableBy(projectId, user);
            await this.entityManager.lock(project, LockMode.PESSIMISTIC_WRITE);
            return change(project);
        });
    }

    private async findMember(project: Project, userId: string): Promise<ProjectMember> {
        const member = await this.entityManager.findOne(ProjectMember, { project, user: userId });
        if (!member) {
            throw new UserError("notAMember", "The user is not a member of the project");
        }
        return member;
    }

    private async assertProjectKeepsAnOwner(project: Project, member: ProjectMember): Promise<void> {
        if (member.role !== ProjectMemberRole.owner) {
            return;
        }
        const ownerCount = await this.entityManager.count(ProjectMember, { project, role: ProjectMemberRole.owner });
        if (ownerCount <= 1) {
            throw new UserError("lastOwner", "A project needs at least one owner. Make another member an owner first.");
        }
    }
}
