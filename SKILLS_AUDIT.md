# Skills audit and resolution report

Audit updated: 2026-10-12

## Outcome

The previous directory contained 14 flat Markdown files totaling roughly 6,500 lines. They were not
in the discoverable `.claude/skills/<name>/SKILL.md` layout and repeatedly taught obsolete SQLite,
`BaseRepository`, `/dashboard`, React Query, and React Hook Form defaults.

Those files and the stale `skills-lock.json` entry were removed. They were replaced by seven small,
task-oriented skills:

| Skill | Use it for | Alignment |
| --- | --- | --- |
| `feature-development` | New/refactored features, routes, actions, loaders, queries, and services | Current layered tracker architecture |
| `auth-and-authorization` | Sessions, middleware, roles, API auth, and ownership | Better Auth plus `userContext` and current middleware |
| `database-and-migrations` | PostgreSQL schemas, Drizzle, transactions, migrations, backup/restore | PostgreSQL-only and safety-first |
| `forms-and-errors` | Native forms, Zod, action data, redirects, statuses, logging | Current error/result convention |
| `ui-and-i18n` | Components, accessibility, responsive states, Paraglide | Current shared UI and bilingual catalogs |
| `testing-and-review` | Tests, regressions, and code review | Layer-aware mocks and current commands |
| `project-configuration` | Environment, scripts, workers, media, email, and build settings | Actual package and environment configuration |

## Clarity assessment

The new triggers are intentionally narrow so an ordinary task does not load every skill. Each skill:

- directs the agent to the repository-wide `AGENTS.md` source of truth
- contains only repository-specific decisions
- names current examples and commands
- separates authentication, database, form/error, UI/localization, verification, and configuration
  concerns
- avoids fictional files and generic starter tutorials

Only `feature-development` needs an additional reference file; it provides a compact map to current
example features. Other skills are short enough to stand alone.

## Validation

All seven directories pass the official `skill-creator` `quick_validate.py` validator. The
frontmatter names, descriptions, directory names, and Markdown structure are valid.

## Maintenance rule

Update `AGENTS.md` first when a repository-wide convention changes. Update a skill only when its
task-specific workflow changes. Avoid reintroducing a duplicate quick-reference skill or copying
the full architecture into every skill.
