import { randomUUID } from "node:crypto";

import { Entity, Enum, ManyToOne, OneToMany, PrimaryKey, Property, Unique } from "@mikro-orm/decorators/legacy";
import { Collection, OptionalProps, type Ref } from "@mikro-orm/postgresql";
import { Field, ID, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Epic } from "@src/epics/entities/epic.entity.js";
import { Project } from "@src/projects/entities/project.entity.js";
import { User } from "@src/users/user.entity.js";
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, Min } from "class-validator";
import { LocalDateResolver } from "graphql-scalars";

import { ISSUE_TITLE_MAX_LENGTH, LOCAL_DATE_PATTERN } from "../issue-constraints.js";
import { IssueLink } from "./issue-link.entity.js";

export enum IssueType {
    task = "task",
    bug = "bug",
}
registerEnumType(IssueType, { name: "IssueType" });

export enum IssueStatus {
    todo = "todo",
    inProgress = "inProgress",
    done = "done",
    canceled = "canceled",
}
registerEnumType(IssueStatus, { name: "IssueStatus" });

export enum IssuePriority {
    low = "low",
    normal = "normal",
    high = "high",
}
registerEnumType(IssuePriority, { name: "IssuePriority" });

const closedStatuses = new Set([IssueStatus.done, IssueStatus.canceled]);

@Entity()
@ObjectType()
@Unique({ properties: ["project", "number"] })
export class Issue {
    [OptionalProps]?: "type" | "status" | "priority" | "dueDate" | "description" | "createdAt" | "updatedAt" | "completedAt";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = randomUUID();

    @ManyToOne(() => Project, { ref: true, deleteRule: "cascade" })
    project: Ref<Project>;

    // Always an epic of the same project. Deleting an epic moves or deletes its issues first.
    @ManyToOne(() => Epic, { ref: true, index: true })
    epic: Ref<Epic>;

    @Property()
    @Field(() => Int, { description: "Counts up per project, the key of the issue is built from it, e.g. KEY-42" })
    @IsInt()
    @Min(1)
    number: number;

    @Property()
    @Field()
    @IsString()
    @IsNotEmpty()
    @MaxLength(ISSUE_TITLE_MAX_LENGTH)
    title: string;

    @Enum({ items: () => IssueType })
    @Field(() => IssueType)
    @IsEnum(IssueType)
    type: IssueType = IssueType.task;

    @Enum({ items: () => IssueStatus })
    @Field(() => IssueStatus)
    @IsEnum(IssueStatus)
    status: IssueStatus = IssueStatus.todo;

    @Enum({ items: () => IssuePriority })
    @Field(() => IssuePriority)
    @IsEnum(IssuePriority)
    priority: IssuePriority = IssuePriority.normal;

    @Property({ type: "date", nullable: true })
    @Field(() => LocalDateResolver, { nullable: true })
    @IsOptional()
    @Matches(LOCAL_DATE_PATTERN)
    dueDate: string | null = null;

    @Property()
    @Field({ description: "Markdown" })
    @IsOptional()
    @IsString()
    description: string = "";

    @OneToMany(() => IssueLink, (link) => link.issue, { orderBy: { createdAt: "asc" } })
    links = new Collection<IssueLink>(this);

    @ManyToOne(() => User, { ref: true })
    createdBy: Ref<User>;

    @Property({ type: "timestamp with time zone" })
    @Field()
    createdAt: Date = new Date();

    @Property({ type: "timestamp with time zone", onUpdate: () => new Date() })
    @Field()
    updatedAt: Date = new Date();

    @Property({ type: "timestamp with time zone", nullable: true })
    @Field(() => Date, { nullable: true, description: "When the issue was done or canceled, empty while it is open" })
    completedAt: Date | null = null;

    // Keeps the date of the first completion when a done issue is canceled, and clears it when the issue is reopened
    changeStatus(status: IssueStatus): void {
        if (status === this.status) {
            return;
        }
        this.status = status;
        this.completedAt = closedStatuses.has(status) ? (this.completedAt ?? new Date()) : null;
    }
}
