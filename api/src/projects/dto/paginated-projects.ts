import { ObjectType } from "@nestjs/graphql";
import { Paginated } from "@src/common/paginated.js";

import { Project } from "../entities/project.entity.js";

@ObjectType()
export class PaginatedProjects extends Paginated(Project) {}
