# Debugging

Start with the narrowest failing boundary and avoid logging credentials, tokens, cookies, email
addresses, form payloads, or complete user/session objects.

## Local checks

```bash
pnpm typecheck
pnpm exec vitest run path/to/affected.test.ts
pnpm check
```

Use `pnpm build` when the failure involves routing, SSR, bundling, the email worker, or deployment.
Server logs use the scoped logger in `app/utils/logger.ts`; add only the identifiers and state needed
to diagnose the event.

## Common paths

- Authentication: inspect Better Auth configuration, route middleware, and `userContext`.
- Authorization: verify both middleware roles and query/service ownership scope.
- Form failures: inspect parsed `FormData`, Zod issues, action data, and the returned HTTP status.
- Database failures: confirm `DATABASE_URL`, then inspect the feature query and generated SQL.
- Localization: update both message catalogs and run `pnpm i18n:compile`.
- Route typing: inspect `app/routes.ts`, then run `pnpm typecheck` to regenerate route types.

Browser output is not a safe place for server data. Temporary diagnostics must be redacted and
removed before the change is complete.
