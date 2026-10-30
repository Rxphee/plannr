import { ArgsType, Field, ID } from "@nestjs/graphql";
import { PaginationArgs } from "@src/common/pagination.args.js";
import { trim } from "@src/common/trim.js";
import { Transform } from "class-transformer";
import { IsOptional, IsString, IsUUID } from "class-validator";

@ArgsType()
export class EpicsArgs extends PaginationArgs {
    @IsUUID("4")
    @Field(() => ID)
    projectId: string;

    @IsOptional()
    @Transform(trim)
    @IsString()
    @Field({ nullable: true, description: "Part of the name" })
    search?: string;
}
