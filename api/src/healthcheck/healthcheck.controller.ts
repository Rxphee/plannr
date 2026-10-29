import { EntityManager } from "@mikro-orm/postgresql";
import { Controller, Get, Header } from "@nestjs/common";

@Controller("healthcheck")
export class HealthcheckController {
    constructor(private readonly entityManager: EntityManager) {}

    @Get("live")
    @Header("cache-control", "no-store")
    live(): string {
        // A non-2xx status code means the process is broken and should be restarted
        return "OK";
    }

    @Get("ready")
    @Header("cache-control", "no-store")
    async ready(): Promise<string> {
        // Without the database the API cannot handle requests, so it should not receive traffic,
        // but restarting it would not help either
        await this.entityManager.execute("SELECT 1+1");
        return "OK";
    }
}
