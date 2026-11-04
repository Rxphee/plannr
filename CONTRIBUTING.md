# Contributing to Plannr

Thanks for your interest! Bug reports, ideas and pull requests are all welcome.

Plannr stays lean on purpose: clear defaults instead of options. Before you build a bigger feature, please open an issue, so we can talk about whether it fits.

## Requirements

- [nvm](https://github.com/nvm-sh/nvm)
- [docker & docker-compose](https://docs.docker.com/compose/)

## Installation

    ./install.sh

## Run Services

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

## Login

Plannr logs in through OpenID Connect with Zitadel. `npm run dev` starts a local Zitadel and sets it up with three users, which you choose from a list when you sign in:

| Name         | Role in the demo data             |
| ------------ | --------------------------------- |
| Ada Admin    | super-admin, sees all projects    |
| Olivia Owner | owns most projects                |
| Mia Member   | member of two projects, owns none |

Run the fixtures (below) once, so they find their projects. Switch users with "Sign out" in the user menu. The list is a small page in `dev/zitadel/login.mts` that only exists in development. The Zitadel console runs at http://localhost:8180/ui/console with the login `zitadel-admin@plannr.localhost` and the password `plannr`.

## Database

    // run pending migrations
    npm --prefix api run db:migrate

    // create a migration from entity changes
    npm --prefix api run db:migration:create

    // drop all tables and fill the database with demo data (development only)
    npm --prefix api run fixtures

## Image Storage

Images are stored in any S3-compatible storage, e.g. Garage, MinIO or AWS S3. It is optional: without `S3_ENDPOINT` the instance has no image uploads. In development `npm run dev` starts a local Garage that sets up its bucket and key by itself. To work without images, set `S3_ENDPOINT=` in `.env.local`.

## MCP

The API serves the MCP interface at `http://localhost:4000/api/mcp`, see [docs/mcp.md](docs/mcp.md).

## Lint

    npm run lint
    npm run lint:fix

## Pull Requests

- Branch off `main`, one pull request per feature or fix. `main` only takes pull requests with green CI.
- Pull requests are squashed, so the title and the description become the commit message. Write them in English, in the imperative, and say what changes and why.
- Keep the code self-explanatory and comments rare, explaining why and not what.
- `AGENTS.md` describes the architecture and conventions in detail, for people and coding agents alike.

## Releases

The root, the API and the web app share one version, in their `package.json` and `package-lock.json`. CI fails when they disagree. To release:

    # on a new branch; merge the pull request with the changed files
    npm run version:set -- 0.2.0

    # afterwards, once the commit is on main
    gh release create v0.2.0 --target main --generate-notes

The release tag builds the images with the version tags. If the tag names another version than the packages, the build fails and publishes nothing.
