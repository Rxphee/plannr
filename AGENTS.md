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

- `api/src/` - NestJS modules by feature: `auth/`, `users/`, `projects/`, `epics/`, `issues/`, `labels/`, `healthcheck/`, `config/`, `db/`; helpers shared by several modules in `common/` (e.g. `trim` for inputs, `PaginationArgs` and `Paginated` for list queries)
- `api/src/db/` - ORM config, `migrations/`, `fixtures/` and the migration generator
- `api/src/console.ts` - Console commands (`migrate`, `fixtures`)
- `web/src/app/` - Next.js App Router pages, Server Actions and their GraphQL documents
- `web/src/components/layout/` - parts of the app shell: `PageHeader`, `PageIntro`, `PageContent`, `ViewTabs`, `SidebarNavLink`
- `web/src/components/richText/` - the Markdown editor (`RichTextEditor`) and its Tiptap extensions
- `web/src/components/ui/` - shadcn/ui components
- `web/src/util/` - `gql` tag and `graphQLFetch`

### Package Independence

Each package has its own `node_modules` and lockfile - this is not an npm workspace monorepo. Install dependencies per package with `npm --prefix <package> install`.

### Path Aliases

All packages use `@src/*` to map to their local `src/` directory (configured in tsconfig.json). The API is ESM (`"type": "module"`), so its relative imports end in `.js`.

### Authentication

Until the OIDC login exists, the global `DevelopmentUserGuard` logs every request in as a fixed development user and refuses all requests in production. `@Public()` marks routes without login (e.g. the healthcheck), `@CurrentUser()` injects the user into a resolver. Users will be created on their first login from the Zitadel token (`oidcSubject` is the `sub` claim), there is no mutation to create users.

### Permissions

The services check the rights, so they hold for GraphQL and a later MCP interface alike. `ProjectsService` knows them: `canManage` (owners and admins: settings, members, status, deleting the project, epics and issues) and `canContribute` (owners, members and admins: creating and editing epics and issues). Viewers only read. Users who are not a member see neither the project nor anything in it, admins see all projects. Both checks are also fields on `Project`, so the web app shows only the actions the user may take. Labels belong to the whole instance: everyone reads them, only admins create, edit and delete them. `LabelsService.canManage` is the one place that decides this (the super-admin joins there), and the query `canManageLabels` tells the web app.

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

A feature module holds `entities/`, `dto/` (inputs), a service with the business logic and thin resolvers that only call the service. The service layer is the core that a later MCP interface will share with GraphQL. Errors the user can correct are thrown as `BadRequestException`; the web app shows their message. A field of another module's type that needs this module's service lives in a resolver of this module, so modules never depend on each other in a circle.

### Pagination

Every list (the queries `projects`, `epics`, `issues`, `labels` and `users`, the field `Project.members`) takes `offset` and `limit` (`PaginationArgs`, at most `MAX_PAGE_SIZE` = 100 per request) and returns `nodes` and `totalCount` (a `Paginated…` type built with `Paginated(Entity)`). Lists of another module are top-level queries with the parent ID (e.g. `epics(projectId)`), not fields of the parent; the members belong to the projects module and stay a field, so the project cards can load a few avatars with the count. The sort order ends with the ID, so entries with the same name keep their place across pages. Only the links and the labels of an issue stay plain lists, they are few by nature. `projects` filters by `statuses` and `search` (part of the name or key), `epics` by `search` (part of the name), `Project.members` by `search` (each word in the first name, last name or email).

### Entities

An entity is a MikroORM entity and a GraphQL object type in one class, with the legacy decorators from `@mikro-orm/decorators/legacy`. IDs are UUID v4 from `randomUUID()` (`node:crypto`). Every entity has `createdAt` and `updatedAt` (`onUpdate`). Relations are `Ref<…>` and exposed in GraphQL through a `@ResolveField` that loads them. Values computed from other tables are `@Formula` properties instead of stored columns (e.g. the issue counts of an epic). Dates without time are `date` columns, strings like `2026-10-29` and the `LocalDate` scalar from graphql-scalars in GraphQL.

### Validation

class-validator runs automatically only on resolver arguments (global `ValidationPipe`). Inputs and entities carry the same domain rules, shared through constants such as `projects/project-constraints.ts`. Only rules that matter: no validators for values the code sets itself (IDs, timestamps), `@IsNotEmpty()` only where other validators would let `""` pass (not next to `@IsEmail()` or a `@Matches` that needs characters), and no length limits on text that nobody types into Plannr. Text inputs are trimmed with `@Transform` before they are validated. Each rule has a spec.

### Migrations

Migrations are generated with `db:migration:create`, which compares the entities with the current database. They only have `up()`: the custom `MigrationGenerator` (`api/src/db/migration-generator.ts`) leaves out `down()`, a broken migration is fixed with a new one. Never change the generated `name` of a migration, MikroORM tracks executed migrations by it. To regenerate a migration that is not merged yet: delete it, run `fixtures` (with no migrations it leaves the database empty), then run `db:migration:create` and `fixtures` again.

Entities and migrations are found relative to `api/src/db/ormconfig.ts`: the console and the MikroORM CLI run from `src/` (TypeScript through `@swc-node/register`), production runs from `dist/`.

### Fixtures

Each entity has its own fixture service in `api/src/db/fixtures/` (`users-fixture.service.ts`, `projects-fixture.service.ts`, `epics-fixture.service.ts`, `issues-fixture.service.ts`). The website project gets more than one page of issues. `FixturesService` drops the tables, runs the migrations and calls them in order. Fixtures create data through the regular services where possible and never run in production.

### Web Structure

Pages are Server Components that load data with `graphQLFetch` (server only). Mutations are Server Actions (`actions.ts`) that take the input as an object and return `{ error?: string }`. GraphQL documents live in `*.gql.ts` next to their use; codegen writes the types to `*.gql.generated.ts` with the prefix `GQL`. Next.js 16 differs from older versions: read `web/AGENTS.md` and the docs in `web/node_modules/next/dist/docs/` before writing Next.js code.

### App Shell

The root layout puts the sidebar (`app/sidebar/`, shadcn variant `inset`) next to every page, so the page sits on its own rounded surface, clearly apart from the navigation. The sidebar works in the context of one project: at the top the `ProjectSwitcher` shows the open project and switches to another (active and paused ones with a search by name or key, then "All projects"; a shadcn `Combobox`, so typing and Enter open the first match), below it `ProjectNavigation` lists the sections of that project (overview, epics, issues, settings; epics come first because they split the project before issues fill it), then the workspace links and the theme switcher. Both find the open project by the key in the path (`useCurrentProject`); outside a project the switcher shows "Choose a project" and the project sections disappear. A page starts with a `PageHeader` (sidebar toggle and breadcrumbs), followed by a `PageIntro` (title, optional icon, badge, meta line, description and the main actions such as "New project", with the view tabs on its bottom border) and the content in a `PageContent`. `PageIntro` and `PageContent` share a centered maximum width, so on wide screens the content does not stretch and title and content line up; forms like the settings get an even smaller width inside. Views of a list (e.g. open and archived projects) are `ViewTabs` that link to search params, so a view can be bookmarked. The sections of a project live in the sidebar, not in tabs; each section page renders its own `PageHeader` and `PageIntro`. `ViewTabs` stay for views within one page, e.g. the fixed views of the issue list. Empty lists show the shadcn `Empty` component with the action that fills them. The pages of epics and issues have a `loading.tsx` with a `PageSkeleton`, so a click answers at once while the server loads the data; loading files higher up would wrap whole subtrees and show the wrong skeleton. Next.js keeps the scroll position when the new page starts in the viewport, which it always does below the sticky header, so detail pages scroll to the top in their `template.tsx` (`ScrollToTop`), which remounts per page but not for changed search params.

Projects are shown as cards (`ProjectCard`) in a grid, with a dashed `NewProjectCard` as the last tile of the open projects (on their last page). Every project has a color, derived from its key by `projectHue` (a fixed list of hues without red), which `ProjectIcon` shows as a tile with the first letter of the key in the sidebar, the cards and the project header. Statuses carry a colored dot (`ProjectStatusBadge`): green for active, amber for paused, gray for archived. Labels have their own page (`app/labels/`) under Workspace in the sidebar, since they belong to no project; their color comes from a fixed palette (`LabelColor` in the API, `labels/labelColors.ts` in the web app), each a tinted badge (`LabelBadge`) with a darker text in the light and a lighter one in the dark theme, and issues show them next to the title. Archived projects only appear in the project list, not in the project switcher. Cards next to each other size to their own content. Lists that can grow long in a card show a few entries and expand on demand (e.g. `ProjectMemberOverview`: owners first, five members, then "Show all" with a scroll area). Lists people browse are paginated in the UI: the issue list, the epics of a project, the project list (per view tab, the tab counts come as aliased `totalCount` queries) and the members in the settings, which have a search and "Add members" above the list, so adding someone needs no scrolling; the dialog adds several people with one role at once (`addProjectMembers`, all or none). Page and page size live in the search params `page` and `size` (`util/pagination.ts`, 10, 25, 50 or 100; 25 by default, 10 for the members in the settings, whose rows are larger; each list passes its default to `parsePagination`); `ListPagination` below the list shows the size select, the range and the page buttons, a changed size keeps the first entry in view, and a page behind the last one redirects to the last one. Lists the web app needs in full (projects in the sidebar, epics as options, labels for the issue form and filter (`fetchLabelOptions`), all members on the overview card and for the add dialog, users to add as members) are loaded page by page with `fetchAllPages` (`util/`), so nothing is cut off at the largest page of the API; the epic options of a project come from `fetchEpicOptions`. The filters of the issue list live in the search params (`issues/issueListParams.ts`): status, type, priority, epic and label take several comma-separated values (`status=all` for no status filter, no status param for the open issues), plus search, page and page size (`size`, left out for the default; it is no filter, so "Reset" keeps it). The filter bar replaces the URL and the page loads the matching issues on the server. Each filter is a `FilterMenu` (dashed button, menu with checkboxes that stays open). `IssueListView` renders filters, list and pagination for the issue list and the page of an epic alike. The project list and the epics of a project have a `ListSearch` above the cards: it writes the search param `search`, which the view tabs and the pagination keep, and a new search starts on the first page. `ListSearch` and the issue filters share `SearchInput` and `useDebouncedSearch`, which applies the search once the user pauses typing. `SearchInput` hides the clear button of the browser for its own `ClearButton`, which is easier to hit and clears the search at once; the project switcher uses it too. It turns red on hover like the other reset actions: "Clear filter" in a `FilterMenu` and the `ResetButton` of the issue filters, which resets search and filters together.

The theme builds on the shadcn preset `b51EUgJ0a` (font Inter) with the style Vega in `globals.css`: neutral gray surfaces and blue (`#2563eb`) as accent color, clearly apart from the red of errors and destructive actions. The sidebar is a step darker than the page surface, cards a step lighter. Everything clickable reacts visibly and quickly (transitions of 100 ms at most, list rows without any; the sticky page header has a plain background, because a backdrop blur repaints on every scrolled frame): buttons get the pointer cursor (set in `globals.css`, Tailwind v4 no longer does it), the primary button lightens and glows on hover, cards lift and tabs underline. The tab underline rests on the border below instead of overlapping it, because with the 17px root font both lines would round to different pixels. The accent is used sparingly: primary buttons, the active tab, focus rings and the logo. The root font size is 17px instead of 16px, so everything measured in rem is a little larger. The theme is light, dark or system, switched with the `ThemeSwitcher` in the sidebar footer (`components/theme/`). The choice lives in the `theme` cookie; the root layout reads it and sets `data-theme` on `<html>` on the server, so no page flashes in the wrong theme. Without the cookie the app follows `prefers-color-scheme`. Each color token is defined once with `light-dark()`, `color-scheme` on `:root` picks the side, and the `dark` variant in `globals.css` covers both the chosen and the system dark mode.

### Forms

Forms use react-final-form like the Dextinity admin, through the components in `web/src/components/form/`, never a plain `<form action>` or react-final-form's `<Form>` directly:

- `FinalForm` - like Dextinity's `FinalForm`: react-final-form state and the HTML `<form>` in one; its children are a function of the form render props (`form`, `values`, `submitting`); `onSubmit` also gets the form API, e.g. to `restart` the form after a successful submit
- `TextField` - label, input and error message; `multiline` renders a textarea
- `SelectField` - label, select and error message for a fixed list of options, each with an optional icon (`OptionSelect`)
- `MultiSelectField` - label and a searchable combobox for several values from a long list, the selected ones as chips (e.g. the people in "Add members"); Escape with the popup closed keeps the selection and closes the dialog, Base UI alone would clear it
- `DateField` - label and `DatePicker` (calendar popover) for a day like `2026-10-29`
- `RichTextField` - label and Markdown editor
- `FormSubmitError` - the error the submit returned, placed where it fits (e.g. above a dialog footer, which reaches the bottom edge of the dialog)

Fields validate themselves while typing: `required` (a value of only spaces counts as empty) and `validate` with the same rules as the API, shared per feature (e.g. `app/projects/projectValidation.ts`). The submit handler calls the Server Action and returns its error as `{ [FORM_ERROR]: error }`.

### Rich Text

Descriptions of epics and issues are Markdown (GFM with task lists), stored as plain text. The API does not parse them. The web app edits and shows them with `RichTextEditor` (Tiptap with `@tiptap/markdown`, `readOnly` for display), in forms through `RichTextField`. Only formatting that Markdown can express is offered: bold, italic, code, headings 1 to 3, lists and checklists, which replace sub-tasks. The editor starts on the client (`immediatelyRender: false`), and the styles of the rendered text are the `.rich-text` class in `globals.css`.

### File Naming

- API: kebab-case with the Nest suffix (`project-member.entity.ts`, `projects.service.ts`)
- Web: React components in PascalCase (`CreateProjectDialog.tsx`), other modules in camelCase (`graphQLFetch.ts`)

### shadcn/ui Components

Add a component with `npx shadcn add <name>` in `web/`, then:

- Rename the file to PascalCase (`button.tsx` → `Button.tsx`) and fix the imports, including those inside the new component (`@src/components/ui/Button`).
- Don't let shadcn overwrite an existing component. Only after switching the style, reinstall all components with `--overwrite` and repeat these steps.
- Hooks go to `web/src/hooks/` in camelCase (`use-mobile.ts` → `useIsMobile.ts`).
- On a case-insensitive file system shadcn asks to overwrite `button.tsx` (it means `Button.tsx`); answer no, e.g. `yes n | npx shadcn add calendar`.
- `shadcn init` and `shadcn add` may rewrite `package-lock.json`. Revert changes that no `package.json` change asked for and run `npm ci`; restart the web dev server afterwards, Turbopack does not recover from a replaced `node_modules`.
- Replace `import * as React from "react"` with named imports (ESLint forbids the namespace import).
- Run `npm --prefix web run lint:fix`; knip ignores unused exports in `components/ui/`.

## References

Tooling and conventions follow Atrium, a Dextinity project, but Plannr does not use Dextinity. Project concept, data model and decisions live outside this repository.
