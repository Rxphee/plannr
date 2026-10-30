import { Transform, Type } from "class-transformer";
import { IsEmail, IsIn, IsInt, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

export class EnvironmentVariables {
    @IsIn(["development", "production", "test"])
    NODE_ENV: "development" | "production" | "test";

    @IsString()
    POSTGRESQL_HOST: string;

    @Type(() => Number)
    @IsInt()
    POSTGRESQL_PORT: number;

    @IsString()
    POSTGRESQL_DB: string;

    @IsString()
    POSTGRESQL_USER: string;

    @IsString()
    POSTGRESQL_PASSWORD: string;

    @IsOptional()
    @IsString()
    SERVER_HOST?: string;

    @Type(() => Number)
    @IsInt()
    API_PORT: number;

    @IsString()
    CORS_ALLOWED_ORIGIN: string;

    @IsUrl({ require_tld: false, protocols: ["http", "https"] })
    OIDC_ISSUER: string;

    @IsString()
    @IsNotEmpty()
    OIDC_AUDIENCE: string;

    // Comma-separated, compared case-insensitively. An invalid address stops the start instead of leaving the instance without super-admin.
    @IsOptional()
    @Transform(({ value }) =>
        typeof value === "string"
            ? value
                  .split(",")
                  .map((email) => email.trim().toLowerCase())
                  .filter((email) => email !== "")
            : value,
    )
    @IsEmail({}, { each: true })
    SUPER_ADMIN_EMAILS?: string[];
}
