import { Field, InputType } from "@nestjs/graphql";
import { trim } from "@src/common/trim.js";
import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

import { LabelColor } from "../entities/label.entity.js";
import { LABEL_NAME_MAX_LENGTH } from "../label-constraints.js";

// Changes only the fields that are given
@InputType()
export class UpdateLabelInput {
    @IsOptional()
    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    @MaxLength(LABEL_NAME_MAX_LENGTH)
    @Field({ nullable: true, description: "Unique regardless of upper and lower case" })
    name?: string;

    @IsOptional()
    @IsEnum(LabelColor)
    @Field(() => LabelColor, { nullable: true })
    color?: LabelColor;
}
