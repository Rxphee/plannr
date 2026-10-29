import { Logger, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import compression from "compression";
import helmet from "helmet";

import { AppModule } from "./app.module.js";
import { createConfig } from "./config/config.js";

async function bootstrap(): Promise<void> {
    const logger = new Logger("bootstrap");
    const config = createConfig(process.env);
    const app = await NestFactory.create<NestExpressApplication>(AppModule.forRoot(config));

    app.setGlobalPrefix("api");

    app.enableCors({
        origin: config.corsAllowedOrigin,
        methods: ["GET", "POST"],
        credentials: false,
        maxAge: 600,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );

    app.disable("x-powered-by");

    app.use(
        helmet({
            // GraphiQL needs inline scripts and styles during development
            contentSecurityPolicy: config.debug ? false : { directives: { "default-src": ["'none'"] }, useDefaults: false },
            xFrameOptions: false, // Disable non-standard header
            strictTransportSecurity: {
                maxAge: 63072000, // 2 years (recommended when subdomains are included)
                includeSubDomains: true,
                preload: true,
            },
            referrerPolicy: { policy: "no-referrer" },
            xContentTypeOptions: true, // value="nosniff" (prevent MIME sniffing)
            xDnsPrefetchControl: false, // Disable non-standard header
            crossOriginResourcePolicy: { policy: "same-site" },
        }),
    );
    app.use(compression());

    // https://mikro-orm.io/docs/usage-with-nestjs#app-shutdown-and-cleanup
    app.enableShutdownHooks();

    await app.listen(config.apiPort, config.serverHost);
    logger.log(`Application is running on: http://${config.serverHost}:${config.apiPort}/`);
}

bootstrap();
