import { Migration } from "@mikro-orm/migrations";

export class Migration20261101170539 extends Migration {
    override name = "Migration20261101170539";

    override up(): void | Promise<void> {
        this.addSql(`alter table "Issue" add "assignee" uuid null;`);
        this.addSql(
            `alter table "Issue" add constraint "Issue_assignee_foreign" foreign key ("assignee") references "User" ("id") on delete set null;`,
        );
        this.addSql(`create index "Issue_assignee_index" on "Issue" ("assignee");`);
    }
}
