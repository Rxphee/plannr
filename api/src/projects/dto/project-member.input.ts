import { Field, ID, InputType } from "@nestjs/graphql";
import { IsEnum, IsUUID } from "class-validator";

import { ProjectMemberRole } from "../entities/project-member.entity.js";

@InputType()
export class ProjectMemberInput {
    @IsUUID("4")
    @Field(() => ID)
    projectId: string;

    @IsUUID("4")
    @Field(() => ID)
    userId: string;

    @IsEnum(ProjectMemberRole)
    @Field(() => ProjectMemberRole)
    role: ProjectMemberRole;
}
