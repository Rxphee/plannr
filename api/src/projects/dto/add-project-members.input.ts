import { Field, ID, InputType } from "@nestjs/graphql";
import { ArrayNotEmpty, ArrayUnique, IsEnum, IsUUID } from "class-validator";

import { ProjectMemberRole } from "../entities/project-member.entity.js";

// Everyone gets the same role, which can be changed per member afterwards
@InputType()
export class AddProjectMembersInput {
    @IsUUID("4")
    @Field(() => ID)
    projectId: string;

    @ArrayNotEmpty()
    @ArrayUnique()
    @IsUUID("4", { each: true })
    @Field(() => [ID])
    userIds: string[];

    @IsEnum(ProjectMemberRole)
    @Field(() => ProjectMemberRole)
    role: ProjectMemberRole;
}
