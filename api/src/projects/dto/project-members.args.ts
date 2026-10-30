import { ArgsType, Field } from "@nestjs/graphql";
import { PaginationArgs } from "@src/common/pagination.args.js";
import { trim } from "@src/common/trim.js";
import { Transform } from "class-transformer";
import { IsOptional, IsString } from "class-validator";

@ArgsType()
export class ProjectMembersArgs extends PaginationArgs {
    @IsOptional()
    @Transform(trim)
    @IsString()
    @Field({ nullable: true, description: "Words that each appear in the first name, last name or email, e.g. a full name" })
    search?: string;
}
