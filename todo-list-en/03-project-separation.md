# Todo: Separating Starter Core, Optional Modules, and Domain

The goal of the separation is that a new project can use the general foundation without having to
remove the Learning Tracker features by hand. The separation is done step by step so the running
application can still be tested at every step.

> Agent notes:
> - `[ ]` = not done. Change to `[x]` only after the phase's "Done criteria" are met and verified.
> - Work in phase order. Do not move all files at once.
> - Dependency direction rule: `core <- optional/domain`. Core must never import optional modules or the domain.
> - Layer labels used in Phase 1: `core`, `optional`, `learning-tracker`, `shared-to-split`.
> - Code identifiers, paths, and commands are in backticks and must be used exactly as written.

## Target split

### Starter core

- React Router, React, TypeScript, Vite, Tailwind, and UI primitives runtime.
- Database connection, migration convention, transaction helper, and health check.
- Basic auth, user settings, middleware, RBAC/permission enforcement, and audit infrastructure.
- Email abstraction, app config, i18n, logging, error handling, testing, and deployment baseline.

### Optional modules

- Admin panel.
- Posts, categories, and rich-text editor.
- Google OAuth, reCAPTCHA, GTM, RabbitMQ, S3-compatible storage, and the audit viewer.
- 2FA/passkey, organizations/teams, billing, webhook, and scheduler if added later.

### Learning Tracker domain

- Learners and learner groups/members.
- Goals, activities, Pomodoro, schedules, learning plans, and learning templates.
- Reports, domain-specific audit extensions, landing-page copy, and domain permissions.

## Phase 1 — Dependency inventory

- [ ] Create a list of routes, schemas, features, components, message keys, env variables, scripts, and
      migrations.
- [ ] Label each item as `core`, `optional`, `learning-tracker`, or `shared-to-split`.
- [ ] Map cross-feature imports and circular dependencies.
- [ ] Map foreign keys from core to domain and from domain to core.
- [ ] Identify branding strings and domain copy in infrastructure.

Done criteria: every feature and schema has a clear owning layer.

## Phase 2 — Create app config and extension points

- [ ] Create configuration for branding, URL, locale, support contact, and metadata.
- [ ] Create typed feature flags with safe, minimal defaults.
- [ ] Create registries for navigation, permissions, email templates, and admin collections.
- [ ] Make sure the domain can add to the registries without core importing domain features.
- [ ] Add validation so registry keys are not duplicated.

Done criteria: core does not know the name or routes of Learning Tracker.

## Phase 3 — Stabilize the public API of each feature

- [ ] Define a public barrel for the components, queries, services, types, and schema that are needed.
- [ ] Remove deep imports across features.
- [ ] Separate interface contracts from the implementations of email, storage, analytics, and queue
      providers.
- [ ] Add a dependency rule or lint check to prevent core from importing the domain.
- [ ] Document the official extension points.

Done criteria: dependencies follow `core <- optional/domain`, not the other direction.

## Phase 4 — Extract the starter core

- [ ] Move auth, users, roles, permissions, audit infrastructure, email, media abstraction, and shared UI
      into the agreed core boundary.
- [ ] Keep the pattern `schemas -> queries -> services -> actions/loaders -> routes`.
- [ ] Separate core migrations from domain migrations, or provide a combined schema generator.
- [ ] Make the public/auth/app shell generic and configurable.
- [ ] Make sure core can typecheck and be tested without the Learning Tracker features.

Done criteria: a core-only variant can build and run auth and settings without domain schemas.

## Phase 5 — Package the optional modules

- [ ] Make the admin panel enable-able without posts/categories.
- [ ] Make posts/categories/editor one content module that can be removed cleanly.
- [ ] Create optional adapters for Google OAuth, reCAPTCHA, GTM, RabbitMQ, and S3.
- [ ] Make sure a disabled module needs no environment variables and creates no empty routes.
- [ ] Add contract tests for every supported module combination.

Done criteria: modules can be added or removed through configuration or a documented generator.

## Phase 6 — Isolate the Learning Tracker domain

- [ ] Group the schemas, routes, services, messages, permissions, seeds, and navigation that belong to
      the domain.
- [ ] Replace internal core imports with the core public API.
- [ ] Make sure ownership/membership rules stay in the domain services/queries.
- [ ] Separate the tags/demo seed and domain data from the core role/permission seed.
- [ ] Add a smoke test for the Learning Tracker application after extraction.

Done criteria: the domain can be installed on top of core without changing core internal files.

## Phase 7 — Generator and presets

- [ ] Provide the presets `minimal`, `standard`, and `full`.
- [ ] Ask for app name, package name, domain, locale, database, email, storage, and modules.
- [ ] Generate `.env.example`, app config, metadata, and documentation according to the choices.
- [ ] Do not generate default credentials or placeholders that look valid for production.
- [ ] Run the generator in a temporary directory in CI tests.

Done criteria: each preset passes install, migration generation/check, typecheck, tests, and build.

## Phase 8 — Documentation and release

- [ ] Write a quick start for core-only and a full example.
- [ ] Write guides for adding a feature, schema, permission, provider, route, and translation.
- [ ] Document the upgrade path and migration compatibility.
- [ ] Add a changelog, versioning, license, security policy, and support policy.
- [ ] Create a release checklist that runs all quality gates.

Done criteria: a new developer can create a project and add one feature without reading the Learning
Tracker code.

## Conceptual target structure

```text
app/
  core/
    auth/
    users/
    authorization/
    audit/
    email/
    media/
    config/
  modules/
    admin/
    content/
  features/
    learners/
    goals/
    activities/
    schedules/
    learning-templates/
    reports/
```

This structure is a conceptual direction, not an instruction to move all files at once. The final names
must be decided after the dependency inventory is finished.

## Overall definition of done

- [ ] The starter core has no Learning Tracker copy, permissions, schemas, or navigation.
- [ ] Core-only, every preset, and the Learning Tracker application pass the quality gate.
- [ ] Modules can be disabled without manually editing many files.
- [ ] Upgrading core does not require direct changes to domain internals.
- [ ] Documentation and the generator produce safe configuration with no secrets.
