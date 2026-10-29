import type { Type } from "@nestjs/common";
import { Field, Int, ObjectType } from "@nestjs/graphql";

// Base of the result types of list queries, e.g. `class PaginatedIssues extends Paginated(Issue) {}`
export function Paginated<Node>(nodeType: Type<Node>) {
    @ObjectType({ isAbstract: true })
    abstract class PaginatedType {
        @Field(() => [nodeType])
        nodes: Node[];

        @Field(() => Int, { description: "All entries that match, not only the ones on this page" })
        totalCount: number;
    }
    return PaginatedType;
}
