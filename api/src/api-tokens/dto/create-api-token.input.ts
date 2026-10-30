import { Field, InputType } from "@nestjs/graphql";
import { trim } from "@src/common/trim.js";
import { Transform, Type } from "class-transformer";
import { IsDate, IsNotEmpty, IsOptional, IsString, MaxLength, MinDate } from "class-validator";

import { API_TOKEN_NAME_MAX_LENGTH } from "../api-token-constraints.js";

@InputType()
export class CreateApiTokenInput {
    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    @MaxLength(API_TOKEN_NAME_MAX_LENGTH)
    @Field()
    name: string;

    @IsOptional()
    @Type(() => Date)
    @IsDate()
    @MinDate(() => new Date(), { message: "expiresAt must lie in the future" })
    @Field(() => Date, { nullable: true, description: "Without a date the token stays valid until it is revoked" })
    expiresAt?: Date | null;
}
