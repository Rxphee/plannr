import { ObjectType } from "@nestjs/graphql";
import { Paginated } from "@src/common/paginated.js";

import { Label } from "../entities/label.entity.js";

@ObjectType()
export class PaginatedLabels extends Paginated(Label) {}
