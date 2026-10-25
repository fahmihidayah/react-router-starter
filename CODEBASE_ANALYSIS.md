# Codebase analysis and resolution report

Analysis updated: 2026-10-12

## Current pattern

The modern learning-tracker features use a consistent dependency direction:

```text
schemas → queries → services → actions/loaders → routes/components
```

The best reference implementations remain `learners`, `goals`, `activities`, and `schedules`.
They keep user-owned data scoped to an authenticated user or membership, put multi-step writes in
transactions, keep routes thin, and colocate tests at architectural boundaries.

## Resolution status

All findings from the original analysis have been addressed.

| Original finding | Resolution |
| --- | --- |
| API unauthenticated response used 400 | `requireApiAuth` now returns 401. |
| Layout error boundaries converted expected failures to 500 | Shared status normalization now preserves 400, 401, 403, and 404 in root, admin, and track-app boundaries. |
| Login/admin debug logs exposed user data | Email, response, and complete user-payload logging was removed. Auth API logging was also reduced to avoid sensitive request/response data. |
| Public stack copy advertised obsolete technology | English and Indonesian copy now describes PostgreSQL, native forms with Zod, TanStack Table, Lexical, and query/service layers. |
| Competing project architectures | `AGENTS.md` is the single repository instruction source. `CLAUDE.md` imports it, README and legacy guides were updated, and obsolete skills were replaced. |
| Biome baseline failed | Configuration was migrated to 2.5.15, formatting/import fixes were applied, and all reported errors, warnings, and informational diagnostics were resolved. `pnpm check` is clean. |
| Shared `any` in logger and React Query provider | Logger inputs now use `unknown`. The unused React Query provider and both React Query packages were removed. |
| Global React Query behavior had no consumers | Provider, devtools, dependency, and root wrapper were removed. |
| Missing test scripts | `pnpm test` and `pnpm test:watch` are now canonical scripts. |
| Inconsistent error/result guidance | `AGENTS.md` and `forms-and-errors` define field-error returns, redirects, expected HTTP responses, and unexpected-error bubbling. |
| SQLite environment variable remained | `DB_FILE_NAME` was removed. Backup/restore scripts now use `DATABASE_URL`, `pg_dump`, and `pg_restore`. |
| Type naming guidance was too broad | `AGENTS.md` limits `T` prefixes to the established Drizzle/Zod patterns and allows descriptive domain/props names. |
| Admin still presented a generic starter/blog | Product title and metadata now use Catat Progress; public/admin post wording and links no longer point to a fake dashboard/blog destination. |

## Additional repairs made while resolving the findings

- Added localized 400 and 401 error pages.
- Removed invalid link semantics from the current breadcrumb item.
- Updated category test URLs from the obsolete `/dashboard` tree to `/admin`.
- Replaced stale SQLite backup documentation and scripts with PostgreSQL-safe behavior, including a
  pre-restore backup and explicit `RESTORE` confirmation.
- Rewrote stale posts and debugging guides so they no longer teach deleted paths or infrastructure.
- Updated package and lock files after removing unused React Query dependencies.

## Verification

- `pnpm typecheck`: passed.
- `pnpm test`: 76 files and 307 tests passed.
- `pnpm check`: 614 files checked with no diagnostics.
- `pnpm build`: client, server, and email worker builds passed.
- Seven project skills passed the official `skill-creator` validator.
- `git diff --check`: passed.

Repository-wide rules and commands are maintained in [`AGENTS.md`](./AGENTS.md).
