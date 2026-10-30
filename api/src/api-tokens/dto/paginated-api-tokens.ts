import { ObjectType } from "@nestjs/graphql";
import { Paginated } from "@src/common/paginated.js";

import { ApiToken } from "../entities/api-token.entity.js";

@ObjectType()
export class PaginatedApiTokens extends Paginated(ApiToken) {}
