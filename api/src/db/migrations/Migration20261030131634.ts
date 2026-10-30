import { Migration } from "@mikro-orm/migrations";

export class Migration20261030131634 extends Migration {
    override name = "Migration20261030131634";

    override up(): void | Promise<void> {
        this.addSql(
            `create table "ApiToken" ("id" uuid not null, "user" uuid not null, "name" text not null, "lookupId" text not null, "secretHash" text not null, "expiresAt" timestamptz null, "lastUsedAt" timestamptz null, "revokedAt" timestamptz null, "createdAt" timestamptz not null, primary key ("id"));`,
        );
        this.addSql(`alter table "ApiToken" add constraint "ApiToken_lookupId_unique" unique ("lookupId");`);

        this.addSql(`alter table "ApiToken" add constraint "ApiToken_user_foreign" foreign key ("user") references "User" ("id") on delete cascade;`);
    }
}
