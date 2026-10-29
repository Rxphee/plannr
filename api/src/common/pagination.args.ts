import { ArgsType, Field, Int } from "@nestjs/graphql";
import { IsInt, Max, Min } from "class-validator";

// The largest page a list query returns. Clients that need a whole list load it page by page.
export const MAX_PAGE_SIZE = 100;

// Every list query takes these, so no request loads a whole table at once
@ArgsType()
export class PaginationArgs {
    @IsInt()
    @Min(0)
    @Field(() => Int, { defaultValue: 0 })
    offset: number;

    @IsInt()
    @Min(1)
    @Max(MAX_PAGE_SIZE)
    @Field(() => Int, { defaultValue: 25 })
    limit: number;
}
