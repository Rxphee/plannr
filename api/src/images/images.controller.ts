import {
    BadRequestException,
    Controller,
    Get,
    Header,
    Param,
    ParseUUIDPipe,
    Post,
    StreamableFile,
    UploadedFile,
    UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CurrentUser } from "@src/auth/current-user.decorator.js";
import type { User } from "@src/users/user.entity.js";

import { imageUrl, MAX_IMAGE_SIZE } from "./image-type.js";
import { ImagesService } from "./images.service.js";

// The part of a multer file that the upload needs
type UploadedImage = { buffer: Buffer };

// REST instead of GraphQL, as images are binary. The web app passes both routes on with the user's access token.
@Controller()
export class ImagesController {
    constructor(private readonly imagesService: ImagesService) {}

    // Multipart with the image in the field "file". Multer answers a larger file with 413 before it is read completely.
    @Post("projects/:key/images")
    @UseInterceptors(FileInterceptor("file", { limits: { fileSize: MAX_IMAGE_SIZE, files: 1 } }))
    async upload(
        @Param("key") projectKey: string,
        @UploadedFile() file: UploadedImage | undefined,
        @CurrentUser() user: User,
    ): Promise<{ id: string; url: string }> {
        if (!file) {
            throw new BadRequestException("Send the image in the form field file");
        }
        const image = await this.imagesService.upload({ projectKey, content: file.buffer }, user);
        return { id: image.id, url: imageUrl(image.id) };
    }

    // An image never changes under its ID, so the browser may keep it
    @Get("images/:id")
    @Header("cache-control", "private, max-age=31536000, immutable")
    async find(@Param("id", new ParseUUIDPipe({ version: "4" })) id: string, @CurrentUser() user: User): Promise<StreamableFile> {
        const { image, content } = await this.imagesService.findContent(id, user);
        return new StreamableFile(content, { type: image.contentType, length: image.size });
    }
}
