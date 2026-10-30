import { Field, ObjectType } from "@nestjs/graphql";

import { ApiToken } from "../entities/api-token.entity.js";

@ObjectType()
export class CreatedApiToken {
    @Field()
    apiToken: ApiToken;

    @Field({ description: "The token to send as `Authorization: Bearer <token>`. Only returned here, Plannr keeps nothing but its hash" })
    token: string;
}
