# Starter App

A production-ready starter for full-stack web apps. It ships authentication, role-based access
control, an admin panel, Redis caching, RabbitMQ background jobs, transactional email with audit
logging, example CRUD features, and a complete test suite — so a new project starts from working
code instead of an empty scaffold.

## Stack

- **Framework:** React Router 7 (SSR), React 19, TypeScript, Vite
- **Database:** PostgreSQL via Drizzle ORM and `postgres-js`
- **Auth:** Better Auth with role- and ownership-based authorization
- **UI:** Tailwind CSS 4, Radix UI, TanStack Table, Lexical
- **Forms & validation:** Native React Router forms with Zod
- **Localization:** Paraglide (English and Indonesian)
- **Testing:** Vitest, Testing Library, Playwright, Biome

## Requirements

- Node.js 20.19 or newer
- pnpm
- PostgreSQL

## Quick start

1. Install dependencies and create your environment file:

   ```bash
   pnpm install
   cp .env.example .env
   ```

2. Edit `.env` and set at least `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, and
   `NODE_ENV`.

3. Prepare the database and create an admin:

   ```bash
   pnpm db:push
   pnpm db:seed:local
   ```

   ```bash
   ADMIN_EMAIL=you@example.com \
   ADMIN_PASSWORD='a-long-unique-passphrase' \
   pnpm db:bootstrap-admin
   ```

4. Start the development server:

   ```bash
   pnpm dev
   ```

The app runs at `http://localhost:5173` by default.

## Common commands

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Build the app and background worker |
| `pnpm start` | Serve the production build |
| `pnpm typecheck` | Generate route types and run TypeScript |
| `pnpm test` | Run all tests once |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:e2e` | Run Playwright end-to-end tests |
| `pnpm check` | Run Biome checks |
| `pnpm check:fix` | Apply safe Biome formatting and fixes |
| `pnpm lint` | Run the linter |

### Database

| Command | Description |
| --- | --- |
| `pnpm db:push` | Push the schema (good for disposable local DBs) |
| `pnpm db:generate` | Generate a migration from schema changes |
| `pnpm db:migrate` | Apply migrations |
| `pnpm db:seed` | Sync roles and permissions (production-safe) |
| `pnpm db:seed:local` | Seed local development data |
| `pnpm db:seed:demo` | Add sample records |
| `pnpm db:bootstrap-admin` | Create or rotate an admin from env credentials |
| `pnpm db:studio` | Open Drizzle Studio |

> Database reset, restore, migration, and seed commands target `DATABASE_URL`. Always confirm the
> target before running destructive commands against an unknown or production database.

## Project structure

```
app/
  features/        # One folder per feature (auth, users, posts, email, queue, …)
    <feature>/
      schemas/     # Database and form (Zod) schemas
      queries/     # Database queries
      services/    # Business logic
      routes/      # Route components, loaders, and actions
  components/ui/   # Shared UI primitives
  routes.ts        # Route configuration
  env.ts           # Validated environment variables
messages/          # Translations (en.json, id.json)
worker/            # RabbitMQ consumers (email worker)
seeds/             # Database seeds and admin bootstrap
drizzle/           # Generated SQL migrations
e2e/               # Playwright tests
```

Each feature follows a consistent dependency direction:

```text
schemas → queries → services → actions/loaders → routes/components
```

The clearest examples are `app/features/posts`, `app/features/categories`, and
`app/features/tags`.

## Environment variables

All environment variables are defined and validated in `app/env.ts` using t3-env and Zod. Import
`{ env }` from `~/env` in application code — never read `process.env` directly.

Required values to get started:

- `DATABASE_URL` — PostgreSQL connection string
- `BETTER_AUTH_SECRET` — auth signing secret
- `BETTER_AUTH_URL` — app base URL (e.g. `http://localhost:5173`)

Optional integrations (all disabled by default) include Google OAuth, reCAPTCHA, Redis rate
limiting, Resend or SMTP email, RabbitMQ job delivery, and S3 media storage. See `.env.example` for
the full list.

## Feature overview

- **auth** — login, register, forgot/reset password, email verification, Google OAuth, reCAPTCHA
- **users** — user CRUD, profile and account settings
- **roles / permissions** — role-based access control with a seeded permission registry
- **admin** — admin panel shell, layout, sidebar, and data tables
- **posts / categories / tags** — reference CRUD features
- **email** — transactional email templates and SMTP/Resend delivery
- **queue** — RabbitMQ connection and publishing
- **audit-log** — structured audit log for sensitive actions
- **security** — Redis-backed rate limiting and security headers
- **observability** — structured logging, Prometheus metrics, and optional Sentry
- **media** — local or S3 media uploads
- **page** — public landing, about, contact, privacy, and terms pages

## Further reading

- [`AGENTS.md`](./AGENTS.md) — architecture, conventions, security boundaries, and verification
- [`DEPLOYMENT.md`](./DEPLOYMENT.md) — deployment guide
- [`DOCKER.md`](./DOCKER.md) — Docker setup
- [`TESTING.md`](./TESTING.md) — testing guide
- [`seeds/README.md`](./seeds/README.md) — seeding and admin password rotation

