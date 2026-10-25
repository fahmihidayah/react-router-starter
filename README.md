# Catat Progress

Catat Progress is a full-stack learning tracker for organizing learner profiles, goals, activities,
schedules, reports, and shared learning records. It also includes an admin area for users, content,
taxonomy, and media management.

## Stack

- React Router 7 with SSR, React 19, TypeScript, and Vite
- PostgreSQL with Drizzle ORM and `postgres-js`
- Better Auth with role- and ownership-based authorization
- Tailwind CSS 4, Radix UI, TanStack Table, and Lexical
- Native React Router forms with Zod validation
- Paraglide localization for English and Indonesian
- Vitest, Testing Library, Playwright, and Biome

## Local setup

Requirements: Node.js 20.19 or newer, pnpm, PostgreSQL, and PostgreSQL client tools when using the
backup/restore scripts.

```bash
pnpm install
cp .env.example .env
```

Set at least `DATABASE_URL`, `BETTER_AUTH_SECRET`, and the application URL values in `.env`. Then
prepare the local database, create the first administrator, and start the app:

```bash
pnpm db:push
pnpm db:seed:local

ADMIN_EMAIL=owner@example.com \
ADMIN_PASSWORD='a-unique-long-passphrase' \
pnpm db:bootstrap-admin

pnpm dev
```

`pnpm db:seed` only synchronizes roles and the permission registry, so it is safe to run against a
production database. `pnpm db:seed:demo` adds sample records for local work, and
`pnpm db:bootstrap-admin` creates or rotates one administrator from environment credentials. The
repository ships no default login. See [`seeds/README.md`](./seeds/README.md) for the full seed and
password-rotation guide.

The template preview endpoint `POST /api/send/email` requires an administrator session and is
disabled when `NODE_ENV=production` unless `EMAIL_TEST_ENDPOINT_ENABLED=true` is set.

Production authentication is rate-limited through Redis. Set `RATE_LIMIT_ENABLED=false` to disable
the feature completely; when enabled, configure `RATE_LIMIT_REDIS_URL` (or `REDIS_URL`) and an
application-specific `RATE_LIMIT_REDIS_PREFIX`. Configure `AUTH_IP_HEADERS` and
`AUTH_TRUSTED_PROXIES` to match the reverse proxy that is allowed to reach the application; never
trust a client-controlled forwarding header. Global security headers, including CSP and HSTS in
production, are applied by the server entry point.

`db:push` is convenient for a disposable local database. For reviewed, persistent schema changes,
use `pnpm db:generate`, inspect the SQL in `drizzle/`, and apply it with `pnpm db:migrate`.

## Architecture

Current tracker features follow this dependency direction:

```text
schemas/db + schemas/form
          ↓
        queries
          ↓
        services
          ↓
   actions and loaders
          ↓
 routes and components
```

The clearest examples are under `app/features/learners`, `app/features/goals`,
`app/features/activities`, and `app/features/schedules`. Route configuration lives in
`app/routes.ts`; shared UI primitives live in `app/components/ui`; source translations live in
`messages/`.

The application has three main route trees:

- public and authentication pages under the optional locale prefix
- authenticated learner workflows under `/track-app`
- administrator workflows under `/admin`

Every route under `/api` declares its access level on the server; the audit table and the rules for
API authorization live in [`docs/api-access-control.md`](./docs/api-access-control.md).

## Common commands

```bash
pnpm dev               # start the development server
pnpm build             # create the application and worker builds
pnpm typecheck         # generate route types and run TypeScript
pnpm test              # run all Vitest tests once
pnpm test:watch        # run Vitest in watch mode
pnpm check             # run Biome checks
pnpm check:fix         # apply safe Biome formatting and fixes
pnpm i18n:compile      # compile Paraglide messages

pnpm db:generate       # generate a reviewed migration from schema changes
pnpm db:migrate        # apply migrations to the configured database
pnpm db:seed           # synchronize roles and permissions (production-safe)
pnpm db:seed:demo      # add local sample records
pnpm db:bootstrap-admin # create or rotate one administrator from environment credentials
pnpm db:studio         # open Drizzle Studio
pnpm db:backup         # create a PostgreSQL custom-format backup
pnpm db:restore        # interactively restore a backup
```

Database reset, restore, migration, and seed commands operate on `DATABASE_URL`. Confirm the target
before running them; never point destructive commands at an unknown or production database.

## Contributor and agent guidance

[`AGENTS.md`](./AGENTS.md) is the repository-wide source of truth for architecture, conventions,
security boundaries, and verification. Task-specific guidance is available as proper skills under
`.claude/skills/<skill-name>/SKILL.md`.
