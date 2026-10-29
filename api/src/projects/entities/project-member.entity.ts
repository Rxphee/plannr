import { Entity, Enum, ManyToOne, Property } from "@mikro-orm/decorators/legacy";
import { OptionalProps, PrimaryKeyProp, type Ref } from "@mikro-orm/postgresql";
import { Field, ObjectType, registerEnumType } from "@nestjs/graphql";
import { User } from "@src/users/user.entity.js";
import { IsEnum } from "class-validator";

import { Project } from "./project.entity.js";

export enum ProjectMemberRole {
    owner = "owner",
    member = "member",
    viewer = "viewer",
}
registerEnumType(ProjectMemberRole, { name: "ProjectMemberRole" });

@Entity()
@ObjectType()
export class ProjectMember {
    [PrimaryKeyProp]?: ["project", "user"];
    [OptionalProps]?: "createdAt" | "updatedAt";

    @ManyToOne(() => Project, { primary: true, ref: true, deleteRule: "cascade" })
    project: Ref<Project>;

    @ManyToOne(() => User, { primary: true, ref: true, deleteRule: "cascade" })
    user: Ref<User>;

    @Enum({ items: () => ProjectMemberRole })
    @Field(() => ProjectMemberRole)
    @IsEnum(ProjectMemberRole)
    role: ProjectMemberRole;

    @Property({ type: "timestamp with time zone" })
    @Field()
    createdAt: Date = new Date();

    @Property({ type: "timestamp with time zone", onUpdate: () => new Date() })
    @Field()
    updatedAt: Date = new Date();
}
