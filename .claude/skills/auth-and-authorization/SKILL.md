---
name: auth-and-authorization
description: Change sign-in, sessions, protected routes, roles, API authentication, or ownership checks in Catat Progress. Use whenever a task can expose or mutate user-owned or administrator-only data.
---

# Authentication and authorization

Read `../../../AGENTS.md` first.

- Use Better Auth through the existing helpers in `app/lib/auth` and user feature modules.
- Protect route trees with `requireUser`, `requireAdmin`, or `requireApiAuth`; read the user from
  `userContext` after middleware succeeds.
- Return `401` when authentication is missing and `403` when an authenticated user lacks access.
- Scope every user-owned read and write by the current user, membership, or role. UI visibility is
  never authorization.
- Avoid logging emails, tokens, cookies, session objects, credentials, or full user payloads.
- Test unauthenticated, forbidden, cross-user, and success paths for every changed boundary.
