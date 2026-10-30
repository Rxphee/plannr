import { Field, ID, InputType } from "@nestjs/graphql";
import { trim } from "@src/common/trim.js";
import { Transform } from "class-transformer";
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, Matches, MaxLength } from "class-validator";
import { LocalDateResolver } from "graphql-scalars";

import { IssuePriority, IssueStatus, IssueType } from "../entities/issue.entity.js";
import { ISSUE_TITLE_MAX_LENGTH, LOCAL_DATE_PATTERN } from "../issue-constraints.js";

// Changes only the fields that are given, so the detail page can save each field on its own
@InputType()
export class UpdateIssueInput {
    @IsOptional()
    @IsUUID("4")
    @Field(() => ID, { nullable: true, description: "Another epic of the same project" })
    epicId?: string;

    @IsOptional()
    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    @MaxLength(ISSUE_TITLE_MAX_LENGTH)
    @Field({ nullable: true })
    title?: string;

    @IsOptional()
    @IsEnum(IssueType)
    @Field(() => IssueType, { nullable: true })
    type?: IssueType;

    @IsOptional()
    @IsEnum(IssueStatus)
    @Field(() => IssueStatus, { nullable: true })
    status?: IssueStatus;

    @IsOptional()
    @IsEnum(IssuePriority)
    @Field(() => IssuePriority, { nullable: true })
    priority?: IssuePriority;

    @IsOptional()
    @Matches(LOCAL_DATE_PATTERN)
    @Field(() => LocalDateResolver, { nullable: true, description: "null removes the due date" })
    dueDate?: string | null;

    @IsOptional()
    @IsUUID("4", { each: true })
    @Field(() => [ID], { nullable: true, description: "Replaces the labels of the issue, an empty list removes all of them" })
    labelIds?: string[];

    @IsOptional()
    @Transform(trim)
    @IsString()
    @Field({ nullable: true, description: "Markdown" })
    description?: string;
}
