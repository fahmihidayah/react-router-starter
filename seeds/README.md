# Database seeds

Seeds are split into three independent concerns so that a production deployment never receives
credentials or demo records that the repository knows about.

| Target | Command | Contents | Safe in production |
| --- | --- | --- | --- |
| `system` | `pnpm db:seed` | Immutable roles and the permission registry | Yes |
| `demo` | `pnpm db:seed:demo` | Sample domain records (tags) | No |
| `local` | `pnpm db:seed:local` | `system` + `demo` | No |
| `admin` | `pnpm db:bootstrap-admin` | One administrator account from environment credentials | Only when credentials are supplied |

`seeds/system.ts`, `seeds/demo.ts`, and `seeds/admin.ts` hold one concern each, and
`seeds/index.ts` dispatches the requested target. Every target is idempotent and can be re-run.

## Admin bootstrap

The repository contains no administrator email or password. Bootstrap the first administrator with
values that exist only in your shell session or secret manager:

```bash
ADMIN_EMAIL=owner@example.com \
ADMIN_PASSWORD='a-unique-long-passphrase' \
ADMIN_NAME='Owner' \
pnpm db:bootstrap-admin
```

`seeds/lib/credentials.ts` enforces the following before any database write:

- `ADMIN_EMAIL` is required and must be a valid address.
- `ADMIN_PASSWORD` is required and must not be one of the known default passwords, including the
  value that shipped in this repository's history.
- The password must be at least 8 characters, or at least 12 characters when `NODE_ENV=production`.
- In production the password must not contain the email local part.

`pnpm db:bootstrap-admin` also verifies the email address, assigns the admin role, and rotates the
credential password of an existing account with the same email. It prints the account email but
never the password.

## Password rotation

1. Sign in as the bootstrap administrator and change the password from the account settings.
2. Remove `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `ADMIN_NAME` from any shell history, `.env` copy, or
   deployment secret that no longer needs them.
3. Prefer per-deployment secrets over committed files. Rotate the administrator password whenever a
   person with access to it leaves the team or a secret may have been exposed.
4. Re-running `pnpm db:bootstrap-admin` with a new `ADMIN_PASSWORD` rotates the stored hash without
   touching other accounts.

## Notes

- `pnpm db:reset`, `pnpm db:fresh`, and `pnpm db:setup` are local helpers. Confirm `DATABASE_URL`
  before running them; see `scripts/README.md`.
- Never commit real credentials. `.env.example` documents variable names only.
