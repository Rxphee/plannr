import { ArgsType, Field } from "@nestjs/graphql";
import { PaginationArgs } from "@src/common/pagination.args.js";
import { trim } from "@src/common/trim.js";
import { Transform } from "class-transformer";
import { IsEnum, IsOptional, IsString } from "class-validator";

import { ProjectStatus } from "../entities/project.entity.js";

@ArgsType()
export class ProjectsArgs extends PaginationArgs {
    @IsOptional()
    @IsEnum(ProjectStatus, { each: true })
    @Field(() => [ProjectStatus], { nullable: true, description: "Projects with any of the statuses, all projects without" })
    statuses?: ProjectStatus[];

    @IsOptional()
    @Transform(trim)
    @IsString()
    @Field({ nullable: true, description: "Part of the name or key" })
    search?: string;
}
