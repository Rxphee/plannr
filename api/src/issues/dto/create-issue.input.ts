import { Field, ID, InputType } from "@nestjs/graphql";
import { trim } from "@src/common/trim.js";
import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, MaxLength } from "class-validator";
import { LocalDateResolver } from "graphql-scalars";

import { IssuePriority, IssueType } from "../entities/issue.entity.js";
import { ISSUE_TITLE_MAX_LENGTH, LOCAL_DATE_PATTERN } from "../issue-constraints.js";

@InputType()
export class CreateIssueInput {
    @IsUUID("4")
    @Field(() => ID)
    projectId: string;

    @IsOptional()
    @IsUUID("4")
    @Field(() => ID, { nullable: true, description: "Defaults to the epic General" })
    epicId?: string | null;

    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    @MaxLength(ISSUE_TITLE_MAX_LENGTH)
    @Field()
    title: string;

    @IsEnum(IssueType)
    @Field(() => IssueType, { defaultValue: IssueType.task })
    type: IssueType;

    @IsEnum(IssuePriority)
    @Field(() => IssuePriority, { defaultValue: IssuePriority.normal })
    priority: IssuePriority;

    @IsOptional()
    @Matches(LOCAL_DATE_PATTERN)
    @Field(() => LocalDateResolver, { nullable: true })
    dueDate?: string | null;

    @IsOptional()
    @IsUUID("4")
    @Field(() => ID, { nullable: true, description: "A member of the project, or an admin, who becomes a member" })
    assigneeId?: string | null;

    @IsUUID("4", { each: true })
    @Field(() => [ID], { defaultValue: [] })
    labelIds: string[];

    @Transform(trim)
    @IsString()
    @Field({ defaultValue: "", description: "Markdown" })
    description: string;
}
