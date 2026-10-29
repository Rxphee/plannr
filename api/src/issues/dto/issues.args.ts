import { ArgsType, Field, ID, InputType, Int } from "@nestjs/graphql";
import { trim } from "@src/common/trim.js";
import { Transform, Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min, ValidateNested } from "class-validator";

import { IssuePriority, IssueStatus, IssueType } from "../entities/issue.entity.js";

const ISSUES_MAX_LIMIT = 100;

// Each list matches any of its values, the lists together match all of them
@InputType()
export class IssueFilter {
    @IsOptional()
    @IsUUID("4", { each: true })
    @Field(() => [ID], { nullable: true, description: "Issues in any of the epics" })
    epicIds?: string[];

    @IsOptional()
    @IsEnum(IssueStatus, { each: true })
    @Field(() => [IssueStatus], { nullable: true, description: "Issues with any of the statuses" })
    statuses?: IssueStatus[];

    @IsOptional()
    @IsEnum(IssueType, { each: true })
    @Field(() => [IssueType], { nullable: true, description: "Issues of any of the types" })
    types?: IssueType[];

    @IsOptional()
    @IsEnum(IssuePriority, { each: true })
    @Field(() => [IssuePriority], { nullable: true, description: "Issues with any of the priorities" })
    priorities?: IssuePriority[];

    @IsOptional()
    @Transform(trim)
    @IsString()
    @Field({ nullable: true, description: "Part of the title, or the number or key of an issue like 42 or KEY-42" })
    search?: string;
}

@ArgsType()
export class IssuesArgs {
    @IsUUID("4")
    @Field(() => ID)
    projectId: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => IssueFilter)
    @Field(() => IssueFilter, { nullable: true })
    filter?: IssueFilter;

    @IsInt()
    @Min(0)
    @Field(() => Int, { defaultValue: 0 })
    offset: number;

    @IsInt()
    @Min(1)
    @Max(ISSUES_MAX_LIMIT)
    @Field(() => Int, { defaultValue: 50 })
    limit: number;
}
