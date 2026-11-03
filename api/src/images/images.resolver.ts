import { Query, Resolver } from "@nestjs/graphql";
import { StorageService } from "@src/storage/storage.service.js";

@Resolver()
export class ImagesResolver {
    constructor(private readonly storage: StorageService) {}

    @Query(() => Boolean, { description: "Whether the instance has a storage for images; without it the descriptions take no image uploads" })
    imageUploadsEnabled(): boolean {
        return this.storage.isEnabled;
    }
}
