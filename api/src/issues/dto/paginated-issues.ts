import { ObjectType } from "@nestjs/graphql";
import { Paginated } from "@src/common/paginated.js";

import { Issue } from "../entities/issue.entity.js";

@ObjectType()
export class PaginatedIssues extends Paginated(Issue) {}
