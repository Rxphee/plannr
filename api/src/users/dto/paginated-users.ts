import { ObjectType } from "@nestjs/graphql";
import { Paginated } from "@src/common/paginated.js";

import { User } from "../user.entity.js";

@ObjectType()
export class PaginatedUsers extends Paginated(User) {}
