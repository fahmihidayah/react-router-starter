---
name: database-and-migrations
description: Change PostgreSQL schemas, Drizzle queries, indexes, constraints, transactions, migrations, seeds, backups, or restores in Catat Progress.
---

# Database and migrations

Read `../../../AGENTS.md` first.

1. Confirm the target database before any state-changing command.
2. Use `drizzle-orm/pg-core` and update the feature schema under `schemas/db/`.
3. Export the schema through the feature barrel and `app/db/schema/index.ts` when needed.
4. Generate with `bun run db:generate`; inspect the SQL and consider existing data before applying.
5. Put direct Drizzle access in queries and multi-step atomic work in a transaction.
6. Add or update query/service tests for constraints, absence, rollback, and ownership behavior.

Never introduce SQLite or edit an already-applied migration to disguise a new schema change. Do not
run push, reset, restore, migrate, or seed commands against an unknown or production target.
