import { EntityManager, type FilterQuery, LockMode, UniqueConstraintViolationException } from "@mikro-orm/postgresql";
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { containsPattern } from "@src/db/contains-pattern.js";
import { Epic } from "@src/epics/entities/epic.entity.js";
import { DEFAULT_EPIC_NAME } from "@src/epics/epic-constraints.js";
import { User } from "@src/users/user.entity.js";

import type { CreateProjectInput } from "./dto/create-project.input.js";
import type { PaginatedProjectMembers } from "./dto/paginated-project-members.js";
import type { PaginatedProjects } from "./dto/paginated-projects.js";
import type { ProjectMemberInput } from "./dto/project-member.input.js";
import type { ProjectMembersArgs } from "./dto/project-members.args.js";
import type { ProjectsArgs } from "./dto/projects.args.js";
import type { UpdateProjectInput } from "./dto/update-project.input.js";
import { Project, ProjectStatus } from "./entities/project.entity.js";
import { ProjectMember, ProjectMemberRole } from "./entities/project-member.entity.js";

@Injectable()
export class ProjectsService {
    constructor(private readonly entityManager: EntityManager) {}

    // Sorted by name, then by ID, so that two projects with the same name keep their order across pages
    async findAllVisibleTo({ statuses, search, offset, limit }: ProjectsArgs, user: User): Promise<PaginatedProjects> {
        const where: FilterQuery<Project> = user.isAdmin ? {} : { members: { user } };
        if (statuses?.length) {
            where.status = { $in: statuses };
        }
        if (search) {
            where.$or = [{ name: { $ilike: containsPattern(search) } }, { key: { $ilike: containsPattern(search) } }];
        }
        const [nodes, totalCount] = await this.entityManager.findAndCount(Project, where, {
            orderBy: { name: "asc", id: "asc" },
            offset,
            limit,
        });
        return { nodes, totalCount };
    }

    async findOneVisibleTo(key: string, user: User): Promise<Project | null> {
        return this.entityManager.findOne(Project, user.isAdmin ? { key } : { key, members: { user } });
    }

    async findOneVisibleById(id: string, user: User): Promise<Project> {
        const project = await this.entityManager.findOne(Project, user.isAdmin ? { id } : { id, members: { user } });
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

    // Settings, status, deletion and members are up to the owners of a project and the admins
    async canManage(project: Project, user: User): Promise<boolean> {
        if (user.isAdmin) {
            return true;
        }
        return (await this.findRole(project, user)) === ProjectMemberRole.owner;
    }

    // Owners, members and admins create and edit epics and issues, viewers only read them
    async canContribute(project: Project, user: User): Promise<boolean> {
        if (user.isAdmin) {
            return true;
        }
        const role = await this.findRole(project, user);
        return role === ProjectMemberRole.owner || role === ProjectMemberRole.member;
    }

    async assertCanContribute(project: Project, user: User): Promise<void> {
        if (!(await this.canContribute(project, user))) {
            throw new ForbiddenException("Viewers can only read the epics and issues of the project");
        }
    }

    async create(input: CreateProjectInput, user: User): Promise<Project> {
        const project = this.entityManager.create(Project, { ...input, createdBy: user });
        this.entityManager.create(ProjectMember, { project, user, role: ProjectMemberRole.owner });
        this.entityManager.create(Epic, { project, name: DEFAULT_EPIC_NAME, isDefault: true });

        try {
            await this.entityManager.flush();
        } catch (error) {
            if (error instanceof UniqueConstraintViolationException) {
                throw new BadRequestException(`The key ${input.key} is already taken by another project`);
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
            throw new BadRequestException("Only archived projects can be deleted");
        }
        await this.entityManager.remove(project).flush();
    }

    async addMember({ projectId, userId, role }: ProjectMemberInput, user: User): Promise<ProjectMember> {
        return this.changeMembers(projectId, user, async (project) => {
            const newMember = await this.entityManager.findOne(User, userId);
            if (!newMember) {
                throw new BadRequestException("The user does not exist");
            }
            if ((await this.entityManager.count(ProjectMember, { project, user: newMember })) > 0) {
                throw new BadRequestException(`${newMember.firstName} ${newMember.lastName} is already a member of the project`);
            }
            return this.entityManager.create(ProjectMember, { project, user: newMember, role });
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
            throw new BadRequestException("The user is not a member of the project");
        }
        return member;
    }

    private async assertProjectKeepsAnOwner(project: Project, member: ProjectMember): Promise<void> {
        if (member.role !== ProjectMemberRole.owner) {
            return;
        }
        const ownerCount = await this.entityManager.count(ProjectMember, { project, role: ProjectMemberRole.owner });
        if (ownerCount <= 1) {
            throw new BadRequestException("A project needs at least one owner. Make another member an owner first.");
        }
    }
}
