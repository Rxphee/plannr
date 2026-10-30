import { randomUUID } from "node:crypto";

import { Entity, Enum, PrimaryKey, Property, Unique } from "@mikro-orm/decorators/legacy";
import { OptionalProps } from "@mikro-orm/postgresql";
import { Field, ID, ObjectType, registerEnumType } from "@nestjs/graphql";
import { IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";

import { LABEL_NAME_MAX_LENGTH } from "../label-constraints.js";

// A fixed palette instead of free colors, so the web app can pick shades that are readable in the light and the dark theme
export enum LabelColor {
    gray = "gray",
    red = "red",
    orange = "orange",
    amber = "amber",
    green = "green",
    teal = "teal",
    blue = "blue",
    violet = "violet",
    pink = "pink",
}
registerEnumType(LabelColor, { name: "LabelColor" });

// Labels belong to the whole instance, so every project uses the same ones
@Entity()
@ObjectType()
// "Upstream" and "upstream" would be the same label to the people who pick it
@Unique({ name: "Label_name_unique", expression: `create unique index "Label_name_unique" on "Label" (lower("name"))` })
export class Label {
    [OptionalProps]?: "color" | "createdAt" | "updatedAt";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = randomUUID();

    @Property()
    @Field()
    @IsString()
    @IsNotEmpty()
    @MaxLength(LABEL_NAME_MAX_LENGTH)
    name: string;

    @Enum({ items: () => LabelColor })
    @Field(() => LabelColor)
    @IsEnum(LabelColor)
    color: LabelColor = LabelColor.gray;

    @Property({ type: "timestamp with time zone" })
    @Field()
    createdAt: Date = new Date();

    @Property({ type: "timestamp with time zone", onUpdate: () => new Date() })
    @Field()
    updatedAt: Date = new Date();
}
