# AGENTS.md

This file provides guidance to AI agents (Copilot, Cursor, Claude) when working with code in this repository.

## Keeping This File Up to Date

When making changes that affect project structure, commands, architecture, ports, conventions, or configuration, update the relevant section of this file to reflect the new state. This includes:

- Adding or removing packages/services
- Changing commands or scripts
- Introducing new patterns or conventions
- Modifying ports, environment files, or Docker services
- Updating tooling or linting configuration

## Project Overview

Plannr is a lean, self-hosted issue tracker: projects, epics and issues with clear defaults instead of endless options. The repository contains two packages:

- **api/** - NestJS GraphQL backend (code-first) with MikroORM/PostgreSQL
- **web/** - Next.js frontend (App Router) with Tailwind CSS and shadcn/ui

The repository is public under AGPL-3.0, so keep it exemplary clean.

## Common Commands

**Important:** Always use the correct Node version before executing any npm command or ./install.sh. Run `nvm use` in the project root to do so.

### Setup

```bash
./install.sh                     # Full installation
```

Use `./install.sh` instead of `npm install` whenever you add, remove, or update dependencies in any `package.json` file.

### Development

```bash
npm run dev                      # Start all services via dev-pm
npx dev-pm status                # Show service status
npx dev-pm logs <service>        # Tail service logs
npx dev-pm restart <service>     # Restart a service
npx dev-pm shutdown              # Stop all services
npm run browser                  # Open GraphiQL and the web app
```

dev-pm reads the `.env` files once on start. After changing a port or another variable it needs, run `npx dev-pm shutdown` and `npm run dev` again.

### Building

```bash
npm run build                    # Build all packages
npm --prefix api run build       # Build API
npm --prefix web run build       # Build Web (includes GraphQL codegen)
```

### Linting

```bash
npm run lint                     # Lint all packages
npm --prefix api run lint        # Lint API (ESLint, knip, Prettier, tsc, API can start)
npm --prefix web run lint        # Lint Web (ESLint, knip, Prettier, tsc)
```

`lint:api-can-start` runs `nest build`, which empties `api/dist`. If the dev server crashes afterwards with `Cannot find module .../dist/main`, run `npx dev-pm restart api`.

### Linting and Formatting (Auto-fix)

```bash
npm run lint:fix                     # Auto-fix all packages
npm --prefix api run lint:fix        # Auto-fix API
npm --prefix web run lint:fix        # Auto-fix Web
```

These commands auto-fix import sorting, rewrite parent imports to `@src/…`, remove unused imports, and apply Prettier formatting. The root `lint:fix` also formats config files outside the packages.

### Testing

```bash
npm --prefix api run test                          # Run all API tests (Vitest)
npm --prefix api run test -- src/path/to/file.spec.ts  # Run a specific test file
npm --prefix api run test -- -t "name"             # Run tests matching a name
npm --prefix api run test:watch                    # Watch mode
npm --prefix web run test                          # Run all Web tests (Vitest)
```

API tests are `*.spec.ts` next to the code, Web tests `*.test.ts`.

### Database

```bash
npm --prefix api run db:migrate               # Run pending migrations
npm --prefix api run db:migration:create      # Create a migration from the entity changes
npm --prefix api run fixtures                 # Drop all tables, run the migrations and fill in demo data
npm --prefix api run console -- --help        # List the console commands
```

### Code Generation

```bash
npm --prefix web run gql:types   # Generate TypeScript types for the GraphQL documents (also runs in dev as web-codegen)
```

`api/schema.gql` is written by the API on start in development and committed; CI fails if it differs from the code.

## Architecture

### Package Structure

- `api/src/` - NestJS modules by feature: `auth/`, `users/`, `projects/`, `healthcheck/`, `config/`, `db/`
- `api/src/db/` - ORM config, `migrations/`, `fixtures/` and the migration generator
- `api/src/console.ts` - Console commands (`migrate`, `fixtures`)
- `web/src/app/` - Next.js App Router pages, Server Actions and their GraphQL documents
- `web/src/components/layout/` - parts of the app shell: `PageHeader`, `ViewTabs`, `SidebarNavLink`
- `web/src/components/ui/` - shadcn/ui components
- `web/src/util/` - `gql` tag and `graphQLFetch`

### Package Independence

Each package has its own `node_modules` and lockfile - this is not an npm workspace monorepo. Install dependencies per package with `npm --prefix <package> install`.

### Path Aliases

All packages use `@src/*` to map to their local `src/` directory (configured in tsconfig.json). The API is ESM (`"type": "module"`), so its relative imports end in `.js`.

### Authentication

Until the OIDC login exists, the global `DevelopmentUserGuard` logs every request in as a fixed development user and refuses all requests in production. `@Public()` marks routes without login (e.g. the healthcheck), `@CurrentUser()` injects the user into a resolver. Users will be created on their first login from the Zitadel token (`oidcSubject` is the `sub` claim), there is no mutation to create users.

### Docker Services

- PostgreSQL 18 (port from `POSTGRESQL_PORT` in `.env`)

### Local Ports

- API: 4000 (GraphQL at `/api/graphql`)
- Web: 3000

### Code Quality

- ESLint with flat config format using `@dextinity/eslint-config` presets
- Prettier: 150 print width, 4 tab width
- Strict TypeScript enabled
- knip for unused files, exports and dependencies
- Pre-commit hooks via husky/lint-staged
- CI on GitHub Actions: lint, test and build per package; `main` only takes squash-merged pull requests with green CI

## Configuration

### TypeScript

- API targets ES2023 with `nodenext` modules
- Web targets ES2022 with `bundler` module resolution

### Environment Files

- `.env` - Development defaults (committed)
- `.env.local` - Local overrides (not committed)
- `.env.secrets` - Local secrets (not committed)

## Key Patterns

### Post-Change Workflow

After making code changes, always run `npm --prefix <package> run lint:fix` for each affected package. This auto-fixes import ordering, removes unused imports, and applies Prettier formatting. Run this before committing or presenting changes as complete.

### API Module Structure

A feature module holds `entities/`, `dto/` (inputs), a service with the business logic and thin resolvers that only call the service. The service layer is the core that a later MCP interface will share with GraphQL. Errors the user can correct are thrown as `BadRequestException`; the web app shows their message.

### Entities

An entity is a MikroORM entity and a GraphQL object type in one class, with the legacy decorators from `@mikro-orm/decorators/legacy`. IDs are UUID v4 from `randomUUID()` (`node:crypto`). Every entity has `createdAt` and `updatedAt` (`onUpdate`). Relations are `Ref<…>` and exposed in GraphQL through a `@ResolveField` that loads them.

### Validation

class-validator runs automatically only on resolver arguments (global `ValidationPipe`). Inputs and entities carry the same domain rules, shared through constants such as `projects/project-constraints.ts`. Only rules that matter: no validators for values the code sets itself (IDs, timestamps), `@IsNotEmpty()` only where other validators would let `""` pass (not next to `@IsEmail()` or a `@Matches` that needs characters), and no length limits on text that nobody types into Plannr. Text inputs are trimmed with `@Transform` before they are validated. Each rule has a spec.

### Migrations

Migrations are generated with `db:migration:create`, which compares the entities with the current database. They only have `up()`: the custom `MigrationGenerator` (`api/src/db/migration-generator.ts`) leaves out `down()`, a broken migration is fixed with a new one. Never change the generated `name` of a migration, MikroORM tracks executed migrations by it. To regenerate a migration that is not merged yet: delete it, run `fixtures` (with no migrations it leaves the database empty), then run `db:migration:create` and `fixtures` again.

Entities and migrations are found relative to `api/src/db/ormconfig.ts`: the console and the MikroORM CLI run from `src/` (TypeScript through `@swc-node/register`), production runs from `dist/`.

### Fixtures

Each entity has its own fixture service in `api/src/db/fixtures/` (`users-fixture.service.ts`, `projects-fixture.service.ts`). `FixturesService` drops the tables, runs the migrations and calls them in order. Fixtures create data through the regular services where possible and never run in production.

### Web Structure

Pages are Server Components that load data with `graphQLFetch` (server only). Mutations are Server Actions (`actions.ts`) that take the input as an object and return `{ error?: string }`. GraphQL documents live in `*.gql.ts` next to their use; codegen writes the types to `*.gql.generated.ts` with the prefix `GQL`. Next.js 16 differs from older versions: read `web/AGENTS.md` and the docs in `web/node_modules/next/dist/docs/` before writing Next.js code.

### App Shell

The root layout puts the sidebar (`app/AppSidebar.tsx`) next to every page. A page starts with a `PageHeader` (breadcrumbs, actions such as "New project") and fills the width below it; only forms like the settings get a maximum width. Views of a list (e.g. open and archived projects) are `ViewTabs` that link to search params, so a view can be bookmarked. The sections of a project are `ViewTabs` in `app/projects/[key]/layout.tsx`; epics and issues will become further tabs there. Empty lists show the shadcn `Empty` component with the action that fills them.

The theme comes from the shadcn preset `b51EUgJ0a` (style Luma, font Inter) with indigo as primary color in `globals.css`. Red stays reserved for destructive actions, bugs and overdue dates.

### Forms

Forms use react-final-form like the Dextinity admin, through the components in `web/src/components/form/`, never a plain `<form action>` or react-final-form's `<Form>` directly:

- `FinalForm` - like Dextinity's `FinalForm`: react-final-form state and the HTML `<form>` in one; its children are a function of the form render props (`form`, `values`, `submitting`)
- `TextField` - label, input and error message; `multiline` renders a textarea
- `SelectField` - label, select and error message for a fixed list of options
- `FormSubmitError` - the error the submit returned, placed where it fits (e.g. above a dialog footer, which reaches the bottom edge of the dialog)

Fields validate themselves while typing: `required` (a value of only spaces counts as empty) and `validate` with the same rules as the API, shared per feature (e.g. `app/projects/projectValidation.ts`). The submit handler calls the Server Action and returns its error as `{ [FORM_ERROR]: error }`.

### File Naming

- API: kebab-case with the Nest suffix (`project-member.entity.ts`, `projects.service.ts`)
- Web: React components in PascalCase (`CreateProjectDialog.tsx`), other modules in camelCase (`graphQLFetch.ts`)

### shadcn/ui Components

Add a component with `npx shadcn add <name>` in `web/`, then:

- Rename the file to PascalCase (`button.tsx` → `Button.tsx`) and fix the imports, including those inside the new component (`@src/components/ui/Button`).
- Don't let shadcn overwrite an existing component. Only after switching the style, reinstall all components with `--overwrite` and repeat these steps.
- Hooks go to `web/src/hooks/` in camelCase (`use-mobile.ts` → `useIsMobile.ts`).
- `shadcn init` and `shadcn add` may rewrite `package-lock.json`. Revert changes that no `package.json` change asked for and run `npm ci`; restart the web dev server afterwards, Turbopack does not recover from a replaced `node_modules`.
- Replace `import * as React from "react"` with named imports (ESLint forbids the namespace import).
- Run `npm --prefix web run lint:fix`; knip ignores unused exports in `components/ui/`.

## References

Tooling and conventions follow Atrium, a Dextinity project, but Plannr does not use Dextinity. Project concept, data model and decisions live outside this repository.
