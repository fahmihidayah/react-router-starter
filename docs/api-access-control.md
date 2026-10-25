# API route access control

Every route under `/api` must declare its access level on the server. A hidden client button or a
generic login is never authorization. The table below is the audit of the current route tree and
must be updated whenever an API route is added, removed, or re-scoped.

| Route | Methods | Access | Enforcement |
| --- | --- | --- | --- |
| `/api/auth/*` | all | Public (Better Auth) | Better Auth handler; CSRF/origin checks, session cookies, and endpoint rate limits are handled upstream |
| `/api/health` | GET | Public | Liveness probe only; exposes no data and no secrets |
| `/api/media/files/:key` | GET | Public | Immutable public media asset; `getLocalMediaPath` rejects path traversal and non-`.webp` keys |
| `/api/users` | GET | Authenticated + `users.read` | `requireApiAuth` then `enforceRoutePermissions` |
| `/api/users/:id` | GET | Authenticated + `users.read` | `requireApiAuth` then `enforceRoutePermissions`; unknown IDs return `404` |
| `/api/users/me` | GET | Authenticated + `account.read` | `requireApiAuth` then `enforceRoutePermissions`; always scoped to the session user |
| `/api/send/email` | POST | Admin, development only by default | `requireTestEmailEnabled` (404 unless `EMAIL_TEST_ENDPOINT_ENABLED=true` or `NODE_ENV !== 'production'`) then `requireApiAdmin` |

## Rules

- Add `export const middleware` with `requireApiAuth` (or `requireApiAdmin`) before any loader or
  action that touches user or administrator data.
- Use `enforceRoutePermissions` for operation-level authorization. The permission registry is the
  source of truth; role guards stay for role-shaped rules such as "admin panel only".
- Return `401` when authentication is missing, `403` when an authenticated user lacks access, and
  `404` for absent resources. Never leak whether a protected resource exists to an unauthorized
  caller.
- Do not add new test, debug, or diagnostic endpoints. Remove them before release; use the
  development-only `/api/send/email` endpoint as the reference pattern for a temporary helper.
- Co-locate tests for the `401`, `403`, and allowed paths of any changed boundary. See
  `app/features/users/middlewares/api-auth.middleware.test.ts` and
  `app/features/permissions/middlewares/permission.middleware.test.ts`.
