import { randomUUID } from "node:crypto";

import { Entity, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { OptionalProps } from "@mikro-orm/postgresql";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

@Entity()
@ObjectType()
export class User {
    [OptionalProps]?: "isEmailVerified" | "isAdmin" | "createdAt" | "updatedAt";

    @PrimaryKey({ type: "uuid" })
    @Field(() => ID)
    id: string = randomUUID();

    // The "sub" claim of the identity provider, the account ID that never changes (unlike the email). Users are created on their first login.
    @Property({ unique: true })
    @IsString()
    @IsNotEmpty()
    oidcSubject: string;

    @Property()
    @Field()
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @Property()
    @Field()
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @Property({ unique: true })
    @Field()
    @IsEmail()
    email: string;

    // "email_verified" of the identity provider, taken over on every login. Only a verified address makes a user super-admin.
    @Property()
    isEmailVerified: boolean = false;

    // Whether a user has admin rights is up to InstanceRolesService, which counts the super-admin too
    @Property()
    @Field({ description: "Appointed by the super-admin, who has admin rights without it (see instanceRole)" })
    isAdmin: boolean = false;

    @Property({ type: "timestamp with time zone" })
    @Field()
    createdAt: Date = new Date();

    @Property({ type: "timestamp with time zone", onUpdate: () => new Date() })
    @Field()
    updatedAt: Date = new Date();
}
