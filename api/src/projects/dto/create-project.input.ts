import { Field, InputType } from "@nestjs/graphql";
import { trim } from "@src/common/trim.js";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, Matches, MaxLength } from "class-validator";

import { PROJECT_KEY_PATTERN, PROJECT_NAME_MAX_LENGTH } from "../project-constraints.js";

@InputType()
export class CreateProjectInput {
    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    @MaxLength(PROJECT_NAME_MAX_LENGTH)
    @Field()
    name: string;

    @IsString()
    @Matches(PROJECT_KEY_PATTERN, { message: "key must consist of 2 to 5 uppercase letters" })
    @Field({ description: "2 to 5 uppercase letters, fixed after creation" })
    key: string;

    @Transform(trim)
    @IsString()
    @Field({ defaultValue: "", description: "Markdown" })
    description: string;
}
