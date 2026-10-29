import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

// Marks a route or resolver that needs no logged-in user, e.g. the healthcheck
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
