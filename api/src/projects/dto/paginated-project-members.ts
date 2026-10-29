import { ObjectType } from "@nestjs/graphql";
import { Paginated } from "@src/common/paginated.js";

import { ProjectMember } from "../entities/project-member.entity.js";

@ObjectType()
export class PaginatedProjectMembers extends Paginated(ProjectMember) {}
