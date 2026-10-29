import { ObjectType } from "@nestjs/graphql";
import { Paginated } from "@src/common/paginated.js";

import { Epic } from "../entities/epic.entity.js";

@ObjectType()
export class PaginatedEpics extends Paginated(Epic) {}
