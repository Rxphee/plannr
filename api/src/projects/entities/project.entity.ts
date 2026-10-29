import { randomUUID } from "node:crypto";

import { Entity, Enum, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { Collection, OptionalProps, type Ref } from "@mikro-orm/postgresql";
import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { User } from "@src/users/user.entity.js";
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, Min } from "class-validator";

import { PROJECT_KEY_PATTERN, PROJECT_NAME_MAX_LENGTH } from "../project-constraints.js";
import { ProjectMember } from "./project-member.entity.js";

export enum ProjectStatus {
    active = "active",
    paused = "paused",
    archived = "archived",
}
registerEnumType(ProjectStatus, { name: "ProjectStatus" });

@Entity()
@ObjectType()
export class Project {
    [OptionalProps]?: "description" | "status" | "issueCounter" | "createdAt" | "updatedAt";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = randomUUID();

    @Property({ unique: true })
    @Field()
    @IsString()
    @Matches(PROJECT_KEY_PATTERN)
    key: string;

    @Property()
    @Field()
    @IsString()
    @IsNotEmpty()
    @MaxLength(PROJECT_NAME_MAX_LENGTH)
    name: string;

    @Property()
    @Field()
    @IsOptional()
    @IsString()
    description: string = "";

    @Enum({ items: () => ProjectStatus })
    @Field(() => ProjectStatus)
    @IsEnum(ProjectStatus)
    status: ProjectStatus = ProjectStatus.active;

    @Property()
    @IsInt()
    @Min(0)
    issueCounter: number = 0;

    @ManyToOne(() => User, { ref: true })
    createdBy: Ref<User>;

    @OneToMany(() => ProjectMember, (member) => member.project)
    members = new Collection<ProjectMember>(this);

    @Property({ type: "timestamp with time zone" })
    @Field()
    createdAt: Date = new Date();

    @Property({ type: "timestamp with time zone", onUpdate: () => new Date() })
    @Field()
    updatedAt: Date = new Date();

    @Property({ type: "timestamp with time zone", nullable: true })
    @Field({ nullable: true })
    archivedAt?: Date;
}
