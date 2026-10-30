import { Migration } from "@mikro-orm/migrations";

export class Migration20261030131017 extends Migration {
    override name = "Migration20261030131017";

    override up(): void | Promise<void> {
        this.addSql(
            `create table "Label" ("id" uuid not null, "name" text not null, "color" text not null default 'gray', "createdAt" timestamptz not null, "updatedAt" timestamptz not null, primary key ("id"));`,
        );
        this.addSql(`create unique index "Label_name_unique" on "Label" (lower("name"));`);

        this.addSql(`create table "IssueLabel" ("issue" uuid not null, "label" uuid not null, primary key ("issue", "label"));`);

        this.addSql(
            `alter table "Label" add constraint "Label_color_check" check ("color" in ('gray', 'red', 'orange', 'amber', 'green', 'teal', 'blue', 'violet', 'pink'));`,
        );

        this.addSql(
            `alter table "IssueLabel" add constraint "IssueLabel_issue_foreign" foreign key ("issue") references "Issue" ("id") on update cascade on delete cascade;`,
        );
        this.addSql(
            `alter table "IssueLabel" add constraint "IssueLabel_label_foreign" foreign key ("label") references "Label" ("id") on update cascade on delete cascade;`,
        );
    }
}
