# Plannr

A lean, self-hosted issue tracker: projects, epics and issues with clear defaults instead of endless options.

- `api/`: NestJS, GraphQL (code-first), MikroORM, PostgreSQL
- `web/`: Next.js, Tailwind CSS, shadcn/ui

## Development

### Requirements

- [nvm](https://github.com/nvm-sh/nvm)
- [docker & docker-compose](https://docs.docker.com/compose/)

### Installation

    ./install.sh

### Run Services

    // use correct npm version https://github.com/nvm-sh/nvm#deeper-shell-integration
    nvm use

    // All services
    npm run dev

    npx dev-pm status [--interval]
    npx dev-pm logs <service>
    npx dev-pm restart <service>
    npx dev-pm shutdown

    // open GraphiQL and the web app
    npm run browser

### Login

Plannr logs in through OpenID Connect with Zitadel. `npm run dev` starts a local Zitadel and sets it up with three users who all have the password `plannr`:

| Login   | Name             | Role in the demo data               |
| ------- | ---------------- | ----------------------------------- |
| `admin` | Ada Admin        | super-admin, sees all projects      |
| `max`   | Max Mustermann   | owns most projects                  |
| `erika` | Erika Mustermann | member of one project, owns another |

Run the fixtures (below) once, so they find their projects. Switch users with "Sign out" in the user menu. The Zitadel console runs at http://localhost:8180/ui/console with the login `zitadel-admin@plannr.localhost` and the password `plannr`.

After updating from a checkout with Keycloak, run `npm run setup-project-files` once, so the web app finds the client credentials of the local Zitadel in `.env.zitadel`.

### Database

    // run pending migrations
    npm --prefix api run db:migrate

    // create a migration from entity changes
    npm --prefix api run db:migration:create

    // drop all tables and fill the database with demo data (development only)
    npm --prefix api run fixtures

### Image Storage

Images are stored in any S3-compatible storage, e.g. Garage, MinIO or AWS S3. It is optional: without `S3_ENDPOINT` the instance has no image uploads. In development `npm run dev` starts a local Garage that sets up its bucket and key by itself. To work without images, set `S3_ENDPOINT=` in `.env.local`.

    // write, read and delete a test object, e.g. after setting up the storage of an instance
    npm --prefix api run console -- storage:check

The API deletes images that no description links to anymore every night at 01:00 (server time), once they are older than a day. To run that by hand:

    npm --prefix api run console -- images:cleanup

### MCP

The API serves an MCP interface at `/api/mcp`, so AI agents like Claude Code can read and change projects, epics and issues. Create a personal API token on the page "API tokens" and add the server, e.g. for the local API:

    claude mcp add --transport http plannr http://localhost:4000/api/mcp --header "Authorization: Bearer plannr_…"

With an image storage, agents can also upload images (`upload_image`) and put the Markdown line it returns into a description. The image travels as Base64 through the agent's output, which costs tokens and in practice limits it to small images; a file on disk is better sent to the API directly:

    curl -H "Authorization: Bearer plannr_…" -F "file=@screenshot.png" http://localhost:4000/api/projects/WEB/images

### Lint

    npm run lint
    npm run lint:fix

## License

Plannr is licensed under the [GNU Affero General Public License v3.0](LICENSE).
