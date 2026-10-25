# Database utilities

All database scripts target the PostgreSQL database in `DATABASE_URL`. Confirm that URL before
running a state-changing command.

## Schema and migration commands

- `pnpm db:generate` generates migration SQL from the current Drizzle schemas.
- `pnpm db:check` validates migration consistency.
- `pnpm db:migrate` applies pending migrations.
- `pnpm db:push` synchronizes schemas directly; use only for disposable local development.
- `pnpm db:studio` opens Drizzle Studio.
- `pnpm db:inspect` reports public tables, columns, keys, row counts, and database size.

Review generated SQL before applying it. Do not run push, migrate, reset, restore, or seed commands
against an unknown or production target.

## Seeding

`pnpm db:seed` synchronizes roles and the permission registry and is safe for production.
`pnpm db:seed:demo` adds local sample records, and `pnpm db:bootstrap-admin` creates or rotates one
administrator from `ADMIN_EMAIL` and `ADMIN_PASSWORD`. See `seeds/README.md` for the seed targets,
credential rules, and password-rotation steps.

## Backup and restore

`pnpm db:backup` calls `pg_dump` and writes a custom-format `.dump` file under `backups/`. It
requires PostgreSQL client tools on `PATH`.

`pnpm db:restore` lists those backups, requires the explicit confirmation word `RESTORE`, creates a
pre-restore safety backup, and then calls `pg_restore --clean --if-exists`. A restore replaces data
in the configured target and is destructive despite the safety backup.

`pnpm db:snapshot` generates a migration and then creates a backup. It does not apply the migration.

## Verification

- `pnpm db:validate` runs Drizzle's migration check and TypeScript validation.
- `pnpm test` runs the Vitest suite.
- `pnpm typecheck` checks route types and TypeScript.
