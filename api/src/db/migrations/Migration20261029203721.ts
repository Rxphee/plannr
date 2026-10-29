import { Migration } from "@mikro-orm/migrations";

export class Migration20261029203721 extends Migration {
    override name = "Migration20261029203721";

    override up(): void | Promise<void> {
        this.addSql(
            `create table "Epic" ("id" uuid not null, "project" uuid not null, "name" text not null, "description" text not null default '', "isDefault" boolean not null default false, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, primary key ("id"));`,
        );
        this.addSql(`create unique index "Epic_project_isDefault_unique" on "Epic" ("project") where "isDefault" = true;`);

        this.addSql(
            `create table "Issue" ("id" uuid not null, "project" uuid not null, "epic" uuid not null, "number" int not null, "title" text not null, "type" text not null default 'task', "status" text not null default 'todo', "priority" text not null default 'normal', "dueDate" date null, "description" text not null default '', "createdBy" uuid not null, "createdAt" timestamptz not null, "updatedAt" timestamptz not null, "completedAt" timestamptz null, primary key ("id"));`,
        );
        this.addSql(`create index "Issue_epic_index" on "Issue" ("epic");`);
        this.addSql(`alter table "Issue" add constraint "Issue_project_number_unique" unique ("project", "number");`);

        this.addSql(
            `create table "IssueLink" ("id" uuid not null, "issue" uuid not null, "url" text not null, "kind" text not null, "createdAt" timestamptz not null, primary key ("id"));`,
        );
        this.addSql(`alter table "IssueLink" add constraint "IssueLink_issue_url_unique" unique ("issue", "url");`);

        this.addSql(
            `alter table "Epic" add constraint "Epic_project_foreign" foreign key ("project") references "Project" ("id") on delete cascade;`,
        );

        this.addSql(
            `alter table "Issue" add constraint "Issue_project_foreign" foreign key ("project") references "Project" ("id") on delete cascade;`,
        );
        this.addSql(`alter table "Issue" add constraint "Issue_epic_foreign" foreign key ("epic") references "Epic" ("id");`);
        this.addSql(`alter table "Issue" add constraint "Issue_createdBy_foreign" foreign key ("createdBy") references "User" ("id");`);
        this.addSql(`alter table "Issue" add constraint "Issue_type_check" check ("type" in ('task', 'bug'));`);
        this.addSql(`alter table "Issue" add constraint "Issue_status_check" check ("status" in ('todo', 'inProgress', 'done', 'canceled'));`);
        this.addSql(`alter table "Issue" add constraint "Issue_priority_check" check ("priority" in ('low', 'normal', 'high'));`);

        this.addSql(
            `alter table "IssueLink" add constraint "IssueLink_issue_foreign" foreign key ("issue") references "Issue" ("id") on delete cascade;`,
        );
        this.addSql(`alter table "IssueLink" add constraint "IssueLink_kind_check" check ("kind" in ('pullRequest', 'other'));`);

        // Projects created before epics existed get their default epic, which every project needs for its issues
        this.addSql(
            `insert into "Epic" ("id", "project", "name", "description", "isDefault", "createdAt", "updatedAt") select gen_random_uuid(), "id", 'General', '', true, now(), now() from "Project";`,
        );
    }
}
