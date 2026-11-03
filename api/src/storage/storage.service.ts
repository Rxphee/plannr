import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import type { StorageConfig } from "@src/config/config.js";

// Any S3-compatible storage. It is optional, so callers check isEnabled before they store anything.
export class StorageService {
    private readonly storage: { client: S3Client; bucket: string } | null;

    constructor(config: StorageConfig | null) {
        this.storage =
            config === null
                ? null
                : {
                      client: new S3Client({
                          endpoint: config.endpoint,
                          region: config.region,
                          forcePathStyle: config.forcePathStyle,
                          credentials: { accessKeyId: config.accessKeyId, secretAccessKey: config.secretAccessKey },
                      }),
                      bucket: config.bucket,
                  };
    }

    get isEnabled(): boolean {
        return this.storage !== null;
    }

    async putObject({ key, body, contentType }: { key: string; body: Uint8Array; contentType: string }): Promise<void> {
        const { client, bucket } = this.requireStorage();
        await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType }));
    }

    async getObject(key: string): Promise<Uint8Array> {
        const { client, bucket } = this.requireStorage();
        const { Body: body } = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
        if (body === undefined) {
            throw new Error(`The S3 object ${key} has no content`);
        }
        return body.transformToByteArray();
    }

    async deleteObject(key: string): Promise<void> {
        const { client, bucket } = this.requireStorage();
        await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    }

    private requireStorage() {
        if (this.storage === null) {
            throw new Error("No S3 storage is configured, check isEnabled first");
        }
        return this.storage;
    }
}
