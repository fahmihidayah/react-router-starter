---
name: feature-development
description: Build or refactor a Catat Progress feature, route, loader, action, query, or service using the repository's current layered architecture. Use for new product behavior or CRUD work; do not use as a replacement for auth, migration, UI-only, or test-specific guidance.
---

# Feature development

Read `../../../AGENTS.md` first. Treat it as authoritative.

## Workflow

1. Inspect the nearest modern feature before designing files. Prefer `learners`, `goals`,
   `activities`, or `schedules` over legacy admin CRUD.
2. Trace the existing route from `app/routes.ts` into its loader/action and feature module.
3. Keep dependencies flowing from schemas to queries to services to actions/loaders to UI.
4. Put persistence only in queries and cross-query business rules or transactions in services.
5. Keep route modules thin and enforce ownership at the query/service boundary.
6. Add focused tests at the layer being changed, then run typecheck and Biome.

## Decisions

- Extend a nearby feature pattern when the behavior is local to that feature.
- Create a cross-feature helper only after two real consumers need the same domain behavior.
- Use a redirect after successful page mutations; return validation data for recoverable form
  errors; throw an HTTP `Response` for expected request failures.
- Do not add `BaseRepository`, SQLite, dashboard-era route names, or React Query infrastructure.

For a compact example map, read `references/examples.md`.
