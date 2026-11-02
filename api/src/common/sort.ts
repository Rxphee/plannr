import { raw } from "@mikro-orm/postgresql";
import { Field, InputType, registerEnumType } from "@nestjs/graphql";
import { IsEnum } from "class-validator";

export enum SortDirection {
    asc = "asc",
    desc = "desc",
}
registerEnumType(SortDirection, { name: "SortDirection" });

// Base of the sort inputs of list queries, e.g. `class IssueSort extends Sort(IssueSortField) {}`
export function Sort<SortField extends string>(fieldEnum: Record<string, SortField>) {
    @InputType({ isAbstract: true })
    abstract class SortType {
        @IsEnum(fieldEnum)
        @Field(() => fieldEnum)
        field: SortField;

        @IsEnum(SortDirection)
        @Field(() => SortDirection)
        direction: SortDirection;
    }
    return SortType;
}

// Orders a text column by the position of its value in the list instead of alphabetically, e.g. the priorities from low to high
export function rankOf(column: string, valuesInOrder: string[]) {
    const values = valuesInOrder.map((value) => `'${value}'`).join(", ");
    return raw((alias) => `array_position(array[${values}], ${alias}."${column}")`);
}
