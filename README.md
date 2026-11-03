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

### Project Export

Owners and admins download a project as a ZIP file under "Export" in the project settings, a backup that needs no database dump. It holds `project.json` with the project, its members, epics, issues and the users and labels they refer to, and the images of the descriptions under `images/`. Scripts fetch the same file with a personal API token:

    curl -OJ -H "Authorization: Bearer plannr_…" http://localhost:4000/api/projects/WEB/export

### MCP

The API serves an MCP interface at `/api/mcp`, so AI agents like Claude Code can read and change projects, epics and issues. Create a personal API token on the page "API tokens" and add the server, e.g. for the local API:

    claude mcp add --transport http plannr http://localhost:4000/api/mcp --header "Authorization: Bearer plannr_…"

With an image storage, agents can also upload images (`upload_image`) and put the Markdown line it returns into a description. The image travels as Base64 through the agent's output, which costs tokens and in practice limits it to small images; a file on disk is better sent to the API directly:

    curl -H "Authorization: Bearer plannr_…" -F "file=@screenshot.png" http://localhost:4000/api/projects/WEB/images

### Lint

    npm run lint
    npm run lint:fix

## Self-Hosting

Plannr runs as two containers, the API and the web app, next to PostgreSQL, an OpenID Connect provider and optionally an S3 storage for images. Every push to `main` publishes both images:

- `ghcr.io/rxphee/plannr-api` (port 4000, runs pending migrations on start)
- `ghcr.io/rxphee/plannr-web` (port 3000)

Every push to `main` tags them `main` and `sha-<commit>`, a release adds its version (`0.2.0`, `0.2`) and `latest`. Pin a deployment to a version or a digest. To build them yourself, run from the repository root:

    docker build -f api/Dockerfile -t plannr-api .
    docker build -f web/Dockerfile -t plannr-web .

The API needs `POSTGRESQL_HOST`, `POSTGRESQL_PORT`, `POSTGRESQL_DB`, `POSTGRESQL_USER`, `POSTGRESQL_PASSWORD`, `CORS_ALLOWED_ORIGIN`, `OIDC_ISSUER` and `OIDC_AUDIENCE`, plus `SUPER_ADMIN_EMAILS` (without it nobody can appoint admins) and the `S3_*` variables for images (see `.env`). The web app needs `API_URL` (the API as the web container reaches it, e.g. `http://api:4000/api`), `WEB_URL` (its public URL), `OIDC_ISSUER`, `OIDC_CLIENT_ID`, `OIDC_CLIENT_SECRET` and `SESSION_SECRET` (at least 32 random characters). The browser never talks to the API directly, so the API only needs to be reachable from outside for agents (MCP at `/api/mcp`) and scripts with an API token.

## Releases

The root, the API and the web app share one version, in their `package.json` and `package-lock.json`. CI fails when they disagree. To release:

    # on a new branch; merge the pull request with the changed files
    npm run version:set -- 0.2.0

    # afterwards, once the commit is on main
    gh release create v0.2.0 --target main --generate-notes

The release tag builds the images with the version tags. If the tag names another version than the packages, the build fails and publishes nothing.

## License

Plannr is licensed under the [GNU Affero General Public License v3.0](LICENSE).
