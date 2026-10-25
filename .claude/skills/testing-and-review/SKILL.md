---
name: testing-and-review
description: Add tests, review a change, investigate a regression, or verify Catat Progress code for correctness, security, accessibility, and architectural consistency.
---

# Testing and review

Read `../../../AGENTS.md` first.

- Start from the requested behavior and inspect the complete data and authorization path.
- Prioritize correctness, data isolation, destructive operations, status codes, validation, and
  regressions over stylistic preferences.
- Co-locate `*.test.ts` or `*.test.tsx` and mock the next architectural boundary.
- Use `// @vitest-environment jsdom` only for tests that need the DOM.
- Cover the main success path plus validation, auth/ownership, absence, and rollback cases that the
  change can affect.
- Run the smallest focused Vitest command first, then `bun run typecheck`, `bun run check`, and `bun run build`
  when routing, SSR, bundling, worker, or deployment behavior changed.
- Report findings with exact file/line evidence and distinguish newly introduced failures from
  unrelated baseline issues.
