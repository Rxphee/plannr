import { Field, InputType } from "@nestjs/graphql";
import { trim } from "@src/common/trim.js";
import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";

import { LabelColor } from "../entities/label.entity.js";
import { LABEL_NAME_MAX_LENGTH } from "../label-constraints.js";

@InputType()
export class CreateLabelInput {
    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    @MaxLength(LABEL_NAME_MAX_LENGTH)
    @Field({ description: "Unique regardless of upper and lower case" })
    name: string;

    @IsEnum(LabelColor)
    @Field(() => LabelColor, { defaultValue: LabelColor.gray })
    color: LabelColor;
}
