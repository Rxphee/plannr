import { Field, Int, ObjectType } from "@nestjs/graphql";

import { Issue } from "../entities/issue.entity.js";

@ObjectType()
export class PaginatedIssues {
    @Field(() => [Issue])
    nodes: Issue[];

    @Field(() => Int, { description: "All issues that match the filter, not only the ones on this page" })
    totalCount: number;
}
