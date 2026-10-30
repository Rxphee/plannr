import { Migration } from "@mikro-orm/migrations";

export class Migration20261030170146 extends Migration {
    override name = "Migration20261030170146";

    override up(): void | Promise<void> {
        this.addSql(`alter table "User" add "isEmailVerified" boolean not null default false;`);
    }
}
