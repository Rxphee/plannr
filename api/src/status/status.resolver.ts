import { Query, Resolver } from "@nestjs/graphql";

@Resolver()
export class StatusResolver {
    @Query(() => String, { description: "Returns OK while the API is running. Placeholder until the first real query exists." })
    status(): string {
        return "OK";
    }
}
