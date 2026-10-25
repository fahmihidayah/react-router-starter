# Learning Tracker Agent Guide

This file is the repository-wide source of truth for coding agents. Prefer the current code and
`package.json` over older starter documentation when they disagree.

## Project baseline

- Use `pnpm` and Node.js 20.19 or newer.
- The application is React Router 7 with SSR, React 19, TypeScript, Vite, and Biome.
- Persistence is PostgreSQL through Drizzle ORM and `postgres-js`. Do not introduce SQLite or
  `better-sqlite3` patterns.
- Authentication uses Better Auth. Authorization is enforced by React Router middleware and the
  request context.
- UI uses Tailwind CSS 4, Radix primitives, and the components in `app/components/ui`.
- Validation uses Zod. Existing feature forms primarily use native React Router forms.
- Localization uses Paraglide with source messages in `messages/en.json` and `messages/id.json`.
- Environment variables are validated using t3-env in `app/env.ts`. Always import `{ env }` from
  `~/env` instead of accessing `process.env` directly.

## Sources of truth and generated files

- Treat `package.json`, `app/routes.ts`, `app/env.ts`, `drizzle.config.ts`, and current feature
  code as authoritative.
- Use `app/features/learners`, `app/features/goals`, `app/features/activities`, and
  `app/features/schedules` as the clearest examples of the current application architecture.
- Some admin CRUD code and older Markdown documents still contain starter-era patterns. Match the
  surrounding feature when editing it, but do not propagate obsolete SQLite, `BaseRepository`,
  `/dashboard`, or React Hook Form assumptions into new code.
- Do not hand-edit generated output in `app/paraglide`, `.react-router`, `build`, or `dist`.
- Never read values from `.env` into output or commit secrets. Update `.env.example` only with safe
  placeholders when a new variable is introduced.

## Environment variables

- All environment variables are centrally defined and validated in `app/env.ts` using t3-env and Zod.
- Always import `{ env }` from `~/env` to access environment variables. Never use `process.env`
  directly in application code.
- When adding a new environment variable:
  1. Add it to the appropriate section in `app/env.ts` with its Zod schema and default if applicable
  2. Add cross-field validation if the variable depends on other variables being set
  3. Update `.env.example` with a safe placeholder and documentation
  4. The variable will automatically be type-safe and validated at application startup
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
- Route modules should be thin orchestration layers. They export route `meta`, `loader`, and
  `action` functions as needed and default-export the route component.
- Prefer named exports outside route modules and framework configuration files.
- Cross-feature dependencies are allowed when the domain requires them. Prefer the depended-on
  feature's public barrel (`services`, `queries`, `types`, or `components`) and avoid accidental
  circular dependencies.

## Routing, authentication, and authorization

- `app/routes.ts` is hybrid: public/auth routes are under optional `:locale?`; `/api`, `/admin`, and
  `/track-app` are explicit non-localized route trees.
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
- For new public and `/track-app` copy, add matching keys to both `messages/en.json` and
  `messages/id.json`, then import `~/paraglide/messages.js`. Do not edit compiled Paraglide files.

## TypeScript, naming, and styling

- Use kebab-case filenames and the `~/` alias for imports from `app/`.
- Avoid `any` in new or changed code. Use concrete types, generics, `unknown` plus narrowing, or a
  narrow test-only cast.
- Keep the established `T` prefix for Drizzle inferred row/insert types and many Zod input types
  (`TLearner`, `TInsertLearner`, `TCreateLearner`). Do not force the prefix onto every domain,
  result, or props type; current code uses descriptive names such as `LearnerListItem` and
  `LearnerFormProps`.
- Reuse `app/components/ui` primitives before adding another base component. Put feature-specific
  composites under that feature.
- Use semantic theme tokens and accessible labels. Preserve keyboard behavior, focus handling,
  `aria-*` relationships, loading states, and empty states.
- Biome defines formatting: 2 spaces, single quotes in TypeScript, semicolons as needed, trailing
  commas, and a 100-character line width.

## Database changes

- Use PostgreSQL APIs from `drizzle-orm/pg-core`.
- Update feature schemas first, then generate a migration with `pnpm db:generate`.
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
- Test authorization and ownership boundaries, validation failures, redirects/status codes,
  rollback/cleanup behavior, and the main success path.
- Run the smallest relevant checks first:
  - `pnpm exec vitest run <affected-test-files>`
  - `pnpm test` for the full unit/integration suite
  - `pnpm typecheck`
  - `pnpm check`
  - `pnpm build` when routing, bundling, SSR, worker, or deployment behavior changes
- Fix failures caused by the requested change. Report unrelated pre-existing failures instead of
  silently broadening the task.

