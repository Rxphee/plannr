import { EntityManager } from "@mikro-orm/postgresql";
import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Issue } from "@src/issues/entities/issue.entity.js";
import type { Project } from "@src/projects/entities/project.entity.js";
import { ProjectsService } from "@src/projects/projects.service.js";
import type { User } from "@src/users/user.entity.js";

import type { CreateEpicInput } from "./dto/create-epic.input.js";
import type { UpdateEpicInput } from "./dto/update-epic.input.js";
import { Epic } from "./entities/epic.entity.js";

@Injectable()
export class EpicsService {
    constructor(
        private readonly entityManager: EntityManager,
        private readonly projectsService: ProjectsService,
    ) {}

    // General first, then by name
    async findAll(project: Project): Promise<Epic[]> {
        return this.entityManager.find(Epic, { project }, { orderBy: { isDefault: "desc", name: "asc" } });
    }

    async findOneVisibleTo(id: string, user: User): Promise<Epic | null> {
        return this.entityManager.findOne(Epic, user.isAdmin ? { id } : { id, project: { members: { user } } });
    }

    async findDefault(project: Project): Promise<Epic> {
        return this.entityManager.findOneOrFail(Epic, { project, isDefault: true });
    }

    // Issues move between epics only within their project
    async findOneInProject(id: string, project: Project): Promise<Epic> {
        const epic = await this.entityManager.findOne(Epic, { id, project });
        if (!epic) {
            throw new BadRequestException("The epic does not exist in the project");
        }
        return epic;
    }

    async create({ projectId, ...input }: CreateEpicInput, user: User): Promise<Epic> {
        const project = await this.projectsService.findOneVisibleById(projectId, user);
        await this.projectsService.assertCanContribute(project, user);

        const epic = this.entityManager.create(Epic, { ...input, project });
        await this.entityManager.flush();
        return epic;
    }

    async update(id: string, input: UpdateEpicInput, user: User): Promise<Epic> {
        const epic = await this.findOneOrFail(id, user);
        await this.projectsService.assertCanContribute(await epic.project.loadOrFail(), user);

        this.entityManager.assign(epic, input);
        await this.entityManager.flush();
        return epic;
    }

    // Moves the issues of the epic to another epic of the project, or deletes them without one
    async delete(id: string, moveIssuesToEpicId: string | null | undefined, user: User): Promise<void> {
        await this.entityManager.transactional(async () => {
            const epic = await this.findOneOrFail(id, user);
            const project = await epic.project.loadOrFail();
            if (!(await this.projectsService.canManage(project, user))) {
                throw new ForbiddenException("Only owners and admins can delete epics");
            }
            if (epic.isDefault) {
                throw new BadRequestException(`The epic ${epic.name} cannot be deleted, every project keeps it for the issues without another epic`);
            }

            if (moveIssuesToEpicId) {
                if (moveIssuesToEpicId === epic.id) {
                    throw new BadRequestException("Choose another epic to move the issues to");
                }
                const targetEpic = await this.findOneInProject(moveIssuesToEpicId, project);
                await this.entityManager.nativeUpdate(Issue, { epic }, { epic: targetEpic });
            } else {
                await this.entityManager.nativeDelete(Issue, { epic });
            }

            this.entityManager.remove(epic);
        });
    }

    private async findOneOrFail(id: string, user: User): Promise<Epic> {
        const epic = await this.findOneVisibleTo(id, user);
        if (!epic) {
            throw new NotFoundException("The epic does not exist");
        }
        return epic;
    }
}
