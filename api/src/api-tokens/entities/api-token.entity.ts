import { randomUUID } from "node:crypto";

import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { OptionalProps, type Ref } from "@mikro-orm/postgresql";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { User } from "@src/users/user.entity.js";
import { IsNotEmpty, IsString, MaxLength } from "class-validator";

import { API_TOKEN_NAME_MAX_LENGTH } from "../api-token-constraints.js";

// A personal token that logs in its user on any API request, e.g. from MCP clients or scripts.
// No updatedAt: a token never changes, only its use and revocation are recorded with their own times.
@Entity()
@ObjectType()
export class ApiToken {
    [OptionalProps]?: "expiresAt" | "lastUsedAt" | "revokedAt" | "createdAt";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = randomUUID();

    @ManyToOne(() => User, { ref: true, deleteRule: "cascade" })
    user: Ref<User>;

    @Property()
    @Field({ description: "Chosen by the user to tell the tokens apart, e.g. the device or tool that uses it" })
    @IsString()
    @IsNotEmpty()
    @MaxLength(API_TOKEN_NAME_MAX_LENGTH)
    name: string;

    @Property({ unique: true })
    lookupId: string;

    @Property()
    secretHash: string;

    @Property({ type: "timestamp with time zone", nullable: true })
    @Field(() => Date, { nullable: true, description: "Without a date the token stays valid until it is revoked" })
    expiresAt: Date | null = null;

    @Property({ type: "timestamp with time zone", nullable: true })
    @Field(() => Date, { nullable: true, description: "Accurate to a minute" })
    lastUsedAt: Date | null = null;

    @Property({ type: "timestamp with time zone", nullable: true })
    revokedAt: Date | null = null;

    @Property({ type: "timestamp with time zone" })
    @Field()
    createdAt: Date = new Date();
}

export function isApiTokenActive({ expiresAt, revokedAt }: Pick<ApiToken, "expiresAt" | "revokedAt">, now: Date): boolean {
    return revokedAt === null && (expiresAt === null || expiresAt > now);
}
