import { Module } from "@nestjs/common";
import { ProjectsModule } from "@src/projects/projects.module.js";

import { ImagesController } from "./images.controller.js";
import { ImagesResolver } from "./images.resolver.js";
import { ImagesService } from "./images.service.js";

@Module({ imports: [ProjectsModule], controllers: [ImagesController], providers: [ImagesResolver, ImagesService], exports: [ImagesService] })
export class ImagesModule {}
