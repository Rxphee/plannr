import { Field, ID, InputType } from "@nestjs/graphql";
import { trim } from "@src/common/trim.js";
import { Transform } from "class-transformer";
import { IsUrl, IsUUID } from "class-validator";

import { ISSUE_LINK_URL_OPTIONS } from "../issue-constraints.js";

@InputType()
export class IssueLinkInput {
    @IsUUID("4")
    @Field(() => ID)
    issueId: string;

    @Transform(trim)
    @IsUrl(ISSUE_LINK_URL_OPTIONS, { message: "url must be a link starting with http://, https:// or obsidian://" })
    @Field({ description: "A website, e.g. a pull request on GitHub, or a note in Obsidian" })
    url: string;
}
