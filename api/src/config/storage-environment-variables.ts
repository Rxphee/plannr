import { Transform } from "class-transformer";
import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

// Only validated when S3_ENDPOINT is set, see createConfig
export class StorageEnvironmentVariables {
    @IsUrl({ require_tld: false, require_protocol: true, protocols: ["http", "https"] })
    S3_ENDPOINT: string;

    @IsString()
    @IsNotEmpty()
    S3_REGION: string;

    @IsString()
    @IsNotEmpty()
    S3_BUCKET: string;

    @IsString()
    @IsNotEmpty()
    S3_ACCESS_KEY_ID: string;

    @IsString()
    @IsNotEmpty()
    S3_SECRET_ACCESS_KEY: string;

    // Garage and MinIO expect the bucket in the path instead of the host name
    @IsOptional()
    @Transform(({ value }) => (value === "true" ? true : value === "false" || value === "" ? false : value))
    @IsBoolean()
    S3_FORCE_PATH_STYLE?: boolean;
}
