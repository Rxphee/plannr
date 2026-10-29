import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString } from "class-validator";

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
}
