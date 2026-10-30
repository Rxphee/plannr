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

### Database

    // run pending migrations
    npm --prefix api run db:migrate

    // create a migration from entity changes
    npm --prefix api run db:migration:create

    // drop all tables and fill the database with demo data (development only)
    npm --prefix api run fixtures

### MCP

The API serves an MCP interface at `/api/mcp`, so AI agents like Claude Code can read and change projects, epics and issues. Create a personal API token on the page "API tokens" and add the server, e.g. for the local API:

    claude mcp add --transport http plannr http://localhost:4000/api/mcp --header "Authorization: Bearer plannr_…"

### Lint

    npm run lint
    npm run lint:fix

## License

Plannr is licensed under the [GNU Affero General Public License v3.0](LICENSE).
