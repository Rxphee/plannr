import { Field, ID, InputType } from "@nestjs/graphql";
import { trim } from "@src/common/trim.js";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, IsUUID, MaxLength } from "class-validator";

import { EPIC_NAME_MAX_LENGTH } from "../epic-constraints.js";

@InputType()
export class CreateEpicInput {
    @IsUUID("4")
    @Field(() => ID)
    projectId: string;

    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    @MaxLength(EPIC_NAME_MAX_LENGTH)
    @Field()
    name: string;

    @Transform(trim)
    @IsString()
    @Field({ defaultValue: "", description: "Markdown" })
    description: string;
}
