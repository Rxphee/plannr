import { defineConfig } from "dev-process-manager";

export default defineConfig({
    scripts: [
        {
            name: "docker",
            // dev-pm passes no .env files to its scripts, so compose reads the ports of .env.local itself
            script: "docker compose --env-file .env --env-file .env.local up",
            group: "api",
        },
        {
            name: "api",
            script: "npm --prefix api run start:dev",
            group: "api",
            waitOn: ["tcp:$POSTGRESQL_PORT"],
        },
        {
            name: "web",
            script: "npm --prefix web run dev",
            group: "web",
            waitOn: ["tcp:$API_PORT"],
        },
        {
            name: "web-codegen",
            script: "npm --prefix web run gql:watch",
            group: "web",
            waitOn: ["tcp:$WEB_PORT"],
        },
    ],
});
