import { randomUUID } from "node:crypto";

import { Entity, Formula, ManyToOne, PrimaryKey, Property, Unique } from "@mikro-orm/decorators/legacy";
import { OptionalProps, type Ref } from "@mikro-orm/postgresql";
import { Field, ID, Int, ObjectType } from "@nestjs/graphql";
import { IssueStatus } from "@src/issues/entities/issue.entity.js";
import { Project } from "@src/projects/entities/project.entity.js";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

import { EPIC_NAME_MAX_LENGTH } from "../epic-constraints.js";

@Entity()
@ObjectType()
// Every project has exactly one default epic, the one that cannot be deleted
@Unique({ name: "Epic_project_isDefault_unique", properties: ["project"], where: { isDefault: true } })
export class Epic {
    [OptionalProps]?: "description" | "isDefault" | "issueCount" | "doneIssueCount" | "createdAt" | "updatedAt";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = randomUUID();

    @ManyToOne(() => Project, { ref: true, deleteRule: "cascade" })
    project: Ref<Project>;

    @Property()
    @Field()
    @IsString()
    @IsNotEmpty()
    @MaxLength(EPIC_NAME_MAX_LENGTH)
    name: string;

    @Property()
    @Field({ description: "Markdown" })
    @IsOptional()
    @IsString()
    description: string = "";

    @Property()
    @Field({ description: "Whether this is the epic General, which every project has and which cannot be deleted" })
    @IsBoolean()
    isDefault: boolean = false;

    // Counted on every load instead of stored, so the progress never runs out of date
    @Formula(
        (columns) => `(select count(*)::int from "Issue" where "Issue"."epic" = ${columns.id} and "Issue"."status" <> '${IssueStatus.canceled}')`,
        { type: "integer" },
    )
    @Field(() => Int, { description: "Issues of the epic without the canceled ones" })
    issueCount: number = 0;

    @Formula((columns) => `(select count(*)::int from "Issue" where "Issue"."epic" = ${columns.id} and "Issue"."status" = '${IssueStatus.done}')`, {
        type: "integer",
    })
    @Field(() => Int)
    doneIssueCount: number = 0;

    @Property({ type: "timestamp with time zone" })
    @Field()
    createdAt: Date = new Date();

    @Property({ type: "timestamp with time zone", onUpdate: () => new Date() })
    @Field()
    updatedAt: Date = new Date();
}
