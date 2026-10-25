# Project Guide

This file is the repository-wide source of truth for coding agents. Prefer the current code and
`package.json` over older starter documentation when they disagree.

This is a production-ready starter template for building full-stack web applications. It ships the
foundations most projects need — authentication, role-based access control, an admin panel, Redis
caching, RabbitMQ background jobs, transactional email with audit logging, reference CRUD features,
and a complete test suite — so a new project starts from clean, working code instead of an empty
scaffold.

## Project baseline

- Use `bun` and Node.js 20.19 or newer.
- The application is React Router 7 with SSR, React 19, TypeScript, Vite, and Biome.
- Persistence is PostgreSQL through Drizzle ORM and `postgres-js`. Do not introduce SQLite or
  `better-sqlite3` patterns.
- Authentication uses Better Auth. Authorization is enforced by React Router middleware and the
  request context.
- UI uses Tailwind CSS 4, Radix primitives, and the components in `app/components/ui`.
- Validation uses Zod. Forms use native React Router forms; React Hook Form is reserved for
  interactions that genuinely need complex client-side state.
- Localization uses Paraglide with source messages in `messages/en.json` and `messages/id.json`.
- Environment variables are validated using t3-env in `app/env.ts`. Always import `{ env }` from
  `~/env` instead of accessing `process.env` directly.

## Feature inventory

The starter ships these common features under `app/features/`:

- `auth` — login, register, forgot/reset password, email verification, and optional Google OAuth and
  reCAPTCHA.
- `users` — user CRUD, profile and account settings, and the auth/role/api-role middlewares.
- `roles` and `permissions` — role-based access control with a seeded permission registry.
- `admin` — the admin control panel shell: layout, sidebar, and reusable data-table components.
- `posts`, `categories`, and `tags` — reference CRUD features. Use these as the template for new
  resource features.
- `email` — transactional email templates and SMTP/Resend delivery.
- `queue` — generic RabbitMQ connection and publishing.
- `audit-log` — structured audit log used by email delivery and other audited actions.
- `security` — Redis-backed rate limiting, Redis health, and security headers.
- `observability` — structured logging, Prometheus metrics, and optional Sentry.
- `page` — the public landing, about, contact, privacy, and terms pages.
- `privacy` — consent and terms-acceptance tracking for GDPR-style compliance.

The `worker/` directory holds the RabbitMQ consumer (currently the email worker); `seeds/` seeds
system roles and permissions and can bootstrap an administrator.

## Sources of truth and generated files

- Treat `package.json`, `app/routes.ts`, `app/env.ts`, `drizzle.config.ts`, and current feature code
  as authoritative.
- Use `app/features/posts`, `app/features/categories`, and `app/features/tags` as the clearest
  examples of the feature architecture.
- Some admin CRUD code and older Markdown documents may still contain starter-era or pre-starter
  patterns. Match the surrounding feature when editing, but do not propagate obsolete SQLite,
  `BaseRepository`, `/dashboard`, or React Hook Form assumptions into new code.
- Do not hand-edit generated output in `app/paraglide`, `.react-router`, `build`, `dist`, or `src`.
- Never read values from `.env` into output or commit secrets. Update `.env.example` only with safe
  placeholders when a new variable is introduced.

## Environment variables

- All environment variables are centrally defined and validated in `app/env.ts` using t3-env and Zod.
- Always import `{ env }` from `~/env` to access environment variables. Never use `process.env`
  directly in application code.
- When adding a new environment variable:
  1. Add it to the appropriate section in `app/env.ts` with its Zod schema and default if applicable.
  2. Add cross-field validation if the variable depends on other variables being set.
  3. Update `.env.example` with a safe placeholder and documentation.
  4. The variable will automatically be type-safe and validated at application startup.
- Environment variables are validated once at import time. Failed validation stops the application
  with a clear error message listing all validation failures.

## Architecture

For a new feature, follow this dependency direction unless the feature already has a more specific
local pattern:

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

- Put PostgreSQL table definitions in `app/features/<feature>/schemas/db/` and export them from the
  feature barrel so `app/db/schema/index.ts` can re-export them.
- Put Zod request/form schemas in `schemas/form/`.
- Keep Drizzle calls in `queries/`. Queries handle persistence and return typed rows or explicit
  absence (`undefined`/`false`).
- Keep business rules, ownership checks that coordinate multiple queries, transactions, and data
  shaping in `services/`.
- Keep HTTP concerns in actions/loaders: read the request, obtain the authenticated user from
  context, validate input, call a service, and return or throw an HTTP result.
- Route modules are thin orchestration layers. They export route `meta`, `loader`, and `action`
  functions as needed and default-export the route component.
- Prefer named exports outside route modules and framework configuration files.
- Cross-feature dependencies are allowed when the domain requires them. Prefer the depended-on
  feature's public barrel and avoid accidental circular dependencies.

## Routing, authentication, and authorization

- `app/routes.ts` is hybrid: public/auth routes live under the optional `:locale?` prefix; `/api` and
  `/admin` are explicit non-localized route trees.
- Protect route trees with existing middleware: `requireAdmin`, `requireUser`, or `requireApiAuth`.
  Do not repeat raw `auth.api.getSession()` calls in every child route.
- Read the authenticated user from `userContext` in loaders/actions after middleware has run.
- Every read and mutation involving user-owned data must scope the query to the current user or
  verify membership/role in the service/query layer. A hidden button is not authorization.
- Use redirects for successful form navigation and unauthenticated page flows. Use HTTP responses
  with the correct 400/401/403/404 status for expected request failures.

## Forms, errors, and user-facing copy

- Prefer native `<form method="post">`, `FormData`, Zod `safeParse`, and `useActionData` for ordinary
  forms. Add React Hook Form only when the interaction genuinely needs complex client-side state.
- Use an `intent` field when one route action supports multiple mutations.
- Return field errors in the shape `Record<string, string[] | undefined>` for recoverable validation
  failures.
- It is valid for actions/loaders to throw `Response` for expected HTTP failures. Do not catch an
  unexpected infrastructure error merely to return a misleading success-shaped result.
- Log useful server-side context without secrets, tokens, passwords, or full sensitive payloads.
  Use `logger.scope(...)` when adding new structured logs.
- For new public and user-facing copy, add matching keys to both `messages/en.json` and
  `messages/id.json`, then import `~/paraglide/messages.js`. Do not edit compiled Paraglide files.

## Caching with Redis

- Redis is provided through the `redis` client and backs rate limiting, health checks, and shared
  cache use cases.
- Rate limiting lives in `app/features/security`. Configure `REDIS_URL` (or `RATE_LIMIT_REDIS_URL`),
  `RATE_LIMIT_ENABLED`, and `RATE_LIMIT_REDIS_PREFIX`. When disabled, the app runs without Redis.
- Add feature-specific caching as a dedicated service under that feature, namespace cache keys by
  feature and resource id, and never cache secrets or user-specific data beyond a safe TTL.

## Background jobs (RabbitMQ)

- RabbitMQ is the message queue. The generic publisher lives in `app/features/queue` and exposes
  `enqueue(queue, payload, options)`.
- Consumers run from `worker/` and are built with `bun run worker:build`. The email worker is the
  reference consumer; add new workers there or alongside it.
- Configure `RABBITMQ_URL`, `RABBITMQ_PREFETCH`, and `RABBITMQ_REQUEUE_ON_FAILURE` for the worker.
- Jobs must be idempotent: a job may be delivered more than once.

## Email

- Email templates live in `app/features/email/templates` and are rendered with Handlebars + Juice.
- Delivery uses Nodemailer (SMTP) or Resend, selected by `EMAIL_PROVIDER`.
- `EMAIL_DELIVERY_MODE` selects direct delivery or queue-based delivery through the RabbitMQ worker.
- Every delivery writes an audit-log entry and structured `[Email]` logs carrying a `traceId`. Never
  log SMTP passwords, API keys, message bodies, or full recipient addresses.

## Audit log

- `app/features/audit-log` stores structured audit records. Use it for sensitive or
  business-critical actions (for example, every email delivery and admin mutation).
- Records reference the acting user, the action, and relevant metadata. Keep metadata small and free
  of secrets.

## TypeScript, naming, and styling

- Use kebab-case filenames and the `~/` alias for imports from `app/`.
- Avoid `any` in new or changed code. Use concrete types, generics, `unknown` plus narrowing, or a
  narrow test-only cast.
- Keep the established `T` prefix for Drizzle inferred row/insert types and many Zod input types
  (`TPost`, `TInsertPost`, `TCreatePost`). Do not force the prefix onto every domain, result, or
  props type.
- Reuse `app/components/ui` primitives before adding another base component. Put feature-specific
  composites under that feature.
- Use semantic theme tokens and accessible labels. Preserve keyboard behavior, focus handling,
  `aria-*` relationships, loading states, and empty states.
- Biome defines formatting: 2 spaces, single quotes in TypeScript, semicolons as needed, trailing
  commas, and a 100-character line width.

## Database changes

- Use PostgreSQL APIs from `drizzle-orm/pg-core`.
- Update feature schemas first, then generate a migration with `bun run db:generate`.
- Review generated SQL in `drizzle/` before applying it. Preserve data deliberately for destructive
  or non-null changes.
- Do not run `db:push`, `db:drop`, `db:reset`, migrations, restores, or seeds against an unknown or
  production database. Confirm the target and user intent first.

## Tests and verification

- Co-locate tests as `*.test.ts` or `*.test.tsx`.
- Mock the next architectural boundary: query tests mock the database, service tests mock queries,
  action/loader tests mock services, and component tests exercise visible behavior.
- Add `// @vitest-environment jsdom` to component tests that need a DOM; the default environment is
  Node.
- Cover authorization and ownership boundaries, validation failures, redirects/status codes,
  rollback/cleanup behavior, and the main success path.
- E2E tests live in `e2e/` and run with Playwright.
- Run the smallest relevant checks first:
  - `bunx vitest run <affected-test-files>`
  - `bun run test` for the full unit/integration suite
  - `bun run test:e2e` for Playwright
  - `bun run typecheck`
  - `bun run check`
  - `bun run build` when routing, bundling, SSR, worker, or deployment behavior changes
- Fix failures caused by the requested change. Report unrelated pre-existing failures instead of
  silently broadening the task.
