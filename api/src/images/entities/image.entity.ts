import { randomUUID } from "node:crypto";

import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/decorators/legacy";
import { OptionalProps, type Ref } from "@mikro-orm/postgresql";
import { Project } from "@src/projects/entities/project.entity.js";
import { User } from "@src/users/user.entity.js";

import type { ImageContentType } from "../image-type.js";

// An image in the S3 storage under imageStorageKey(id). Descriptions link to it in Markdown, the cleanup
// deletes images that no description links to anymore.
@Entity()
export class Image {
    [OptionalProps]?: "createdAt";

    @PrimaryKey({ type: "uuid" })
    id: string = randomUUID();

    // Null once the project is deleted, so the cleanup still finds the object in the storage
    @ManyToOne(() => Project, { ref: true, nullable: true, index: true, deleteRule: "set null" })
    project: Ref<Project> | null;

    @ManyToOne(() => User, { ref: true })
    uploadedBy: Ref<User>;

    @Property({ type: "text" })
    contentType: ImageContentType;

    // In bytes
    @Property()
    size: number;

    @Property({ type: "timestamp with time zone" })
    createdAt: Date = new Date();
}
