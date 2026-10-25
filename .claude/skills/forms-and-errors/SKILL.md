---
name: forms-and-errors
description: Implement or repair Catat Progress forms, Zod validation, action results, redirects, HTTP errors, error boundaries, or server-side logging.
---

# Forms and errors

Read `../../../AGENTS.md` first.

- Prefer native React Router forms, `FormData`, Zod `safeParse`, and `useActionData`.
- Use an `intent` value when one action performs multiple mutations.
- Return recoverable field errors as `Record<string, string[] | undefined>`.
- Redirect successful page mutations. Preserve 400/401/403/404 status codes for expected HTTP
  failures and let unexpected failures reach an error boundary after safe contextual logging.
- Use `unknown` for caught values and narrow before reading properties.
- Never expose stack traces or sensitive data in user-facing messages or logs.
- Test invalid data, expected statuses, the success path, and cleanup/rollback behavior.
