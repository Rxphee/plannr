import { trim } from "@src/common/trim.js";
import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

// The claims of the userinfo endpoint that a Plannr user is made of. The names are those of the OIDC standard.
export class UserInfoClaims {
    @IsString()
    @IsNotEmpty()
    sub: string;

    @Transform(({ value }) => (typeof value === "string" ? value.trim().toLowerCase() : value))
    @IsEmail()
    email: string;

    // Anything but true counts as unverified
    @Transform(({ value }) => value === true)
    email_verified?: boolean;

    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    given_name: string;

    @Transform(trim)
    @IsString()
    @IsNotEmpty()
    family_name: string;
}
