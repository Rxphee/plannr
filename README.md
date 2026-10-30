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

Plannr logs in through OpenID Connect. In development a local Keycloak (started with `npm run dev`) stands in for the identity provider, with three users who all have the password `plannr`:

| Login   | Name             | Role in the demo data               |
| ------- | ---------------- | ----------------------------------- |
| `admin` | Ada Admin        | admin, sees all projects            |
| `max`   | Max Mustermann   | owns most projects                  |
| `erika` | Erika Mustermann | member of one project, owns another |

Run the fixtures (below) once, so they find their projects. Switch users with "Sign out" in the user menu.

### Database

    // run pending migrations
    npm --prefix api run db:migrate

    // create a migration from entity changes
    npm --prefix api run db:migration:create

    // drop all tables and fill the database with demo data (development only)
    npm --prefix api run fixtures

### Lint

    npm run lint
    npm run lint:fix

## License

Plannr is licensed under the [GNU Affero General Public License v3.0](LICENSE).
