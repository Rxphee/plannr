import { ArgsType, Field, ID } from "@nestjs/graphql";
import { PaginationArgs } from "@src/common/pagination.args.js";
import { trim } from "@src/common/trim.js";
import { Transform, Type } from "class-transformer";
import { IsOptional, IsString, IsUUID, ValidateNested } from "class-validator";

import { EpicSort } from "../epic-sort.js";

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

    @IsOptional()
    @ValidateNested()
    @Type(() => EpicSort)
    @Field(() => EpicSort, { nullable: true, description: "General always comes first, without a sort the others by name" })
    sort?: EpicSort;
}
