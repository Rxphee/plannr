import { randomUUID } from "node:crypto";

import { Entity, Enum, ManyToOne, PrimaryKey, Property, Unique } from "@mikro-orm/decorators/legacy";
import { OptionalProps, type Ref } from "@mikro-orm/postgresql";
import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { IsEnum, IsUrl } from "class-validator";

import { ISSUE_LINK_URL_OPTIONS } from "../issue-constraints.js";
import { Issue } from "./issue.entity.js";

export enum IssueLinkKind {
    pullRequest = "pullRequest",
    other = "other",
}
registerEnumType(IssueLinkKind, { name: "IssueLinkKind" });

const GITHUB_PULL_REQUEST_URL = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/pull\/\d+(?:[/?#]|$)/;

export function detectIssueLinkKind(url: string): IssueLinkKind {
    return GITHUB_PULL_REQUEST_URL.test(url) ? IssueLinkKind.pullRequest : IssueLinkKind.other;
}

@Entity()
@ObjectType()
@Unique({ properties: ["issue", "url"] })
export class IssueLink {
    [OptionalProps]?: "createdAt";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = randomUUID();

    @ManyToOne(() => Issue, { ref: true, deleteRule: "cascade" })
    issue: Ref<Issue>;

    @Property()
    @Field()
    @IsUrl(ISSUE_LINK_URL_OPTIONS)
    url: string;

    @Enum({ items: () => IssueLinkKind })
    @Field(() => IssueLinkKind, { description: "Detected from the URL, e.g. a pull request on GitHub" })
    @IsEnum(IssueLinkKind)
    kind: IssueLinkKind;

    @Property({ type: "timestamp with time zone" })
    @Field()
    createdAt: Date = new Date();
}
