import { Migration } from "@mikro-orm/migrations";

export class Migration20261029161514 extends Migration {
    override name = "Migration20261029161514";

    override up(): void | Promise<void> {
        this.addSql(
            `create table "User" ("id" uuid not null, "oidcSubject" text not null, "firstName" text not null, "lastName" text not null, "email" text not null, "isAdmin" boolean not null default false, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, primary key ("id"));`,
        );
        this.addSql(`alter table "User" add constraint "User_oidcSubject_unique" unique ("oidcSubject");`);
        this.addSql(`alter table "User" add constraint "User_email_unique" unique ("email");`);

        this.addSql(
            `create table "Project" ("id" uuid not null, "key" text not null, "name" text not null, "description" text not null default '', "status" text not null default 'active', "issueCounter" int not null default 0, "createdBy" uuid not null, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, "archivedAt" timestamptz null, primary key ("id"));`,
        );
        this.addSql(`alter table "Project" add constraint "Project_key_unique" unique ("key");`);

        this.addSql(
            `create table "ProjectMember" ("project" uuid not null, "user" uuid not null, "role" text not null, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, primary key ("project", "user"));`,
        );

        this.addSql(`alter table "Project" add constraint "Project_createdBy_foreign" foreign key ("createdBy") references "User" ("id");`);
        this.addSql(`alter table "Project" add constraint "Project_status_check" check ("status" in ('active', 'paused', 'archived'));`);

        this.addSql(
            `alter table "ProjectMember" add constraint "ProjectMember_project_foreign" foreign key ("project") references "Project" ("id") on update cascade on delete cascade;`,
        );
        this.addSql(
            `alter table "ProjectMember" add constraint "ProjectMember_user_foreign" foreign key ("user") references "User" ("id") on update cascade on delete cascade;`,
        );
        this.addSql(`alter table "ProjectMember" add constraint "ProjectMember_role_check" check ("role" in ('owner', 'member', 'viewer'));`);
    }
}
