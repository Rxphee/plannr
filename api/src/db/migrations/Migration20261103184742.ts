import { Migration } from "@mikro-orm/migrations";

export class Migration20261103184742 extends Migration {
    override name = "Migration20261103184742";

    override up(): void | Promise<void> {
        this.addSql(
            `create table "Image" ("id" uuid not null, "project" uuid null, "uploadedBy" uuid not null, "contentType" text not null, "size" int not null, "createdAt" timestamptz not null, primary key ("id"));`,
        );
        this.addSql(`create index "Image_project_index" on "Image" ("project");`);

        this.addSql(
            `alter table "Image" add constraint "Image_project_foreign" foreign key ("project") references "Project" ("id") on delete set null;`,
        );
        this.addSql(`alter table "Image" add constraint "Image_uploadedBy_foreign" foreign key ("uploadedBy") references "User" ("id");`);
    }
}
