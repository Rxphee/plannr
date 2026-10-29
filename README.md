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

### Lint

    npm run lint
    npm run lint:fix

## License

Plannr is licensed under the [GNU Affero General Public License v3.0](LICENSE).
