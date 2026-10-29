import { ArgsType, Field, ID } from "@nestjs/graphql";
import { PaginationArgs } from "@src/common/pagination.args.js";
import { IsUUID } from "class-validator";

@ArgsType()
export class EpicsArgs extends PaginationArgs {
    @IsUUID("4")
    @Field(() => ID)
    projectId: string;
}
