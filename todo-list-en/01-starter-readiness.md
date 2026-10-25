# Todo: Starter Project Readiness

This document lists the features and hardening work needed before the project is published or used as
a starter. Work by priority, not only by UI order.

> Agent notes:
>
> - `[x]` = done and verified. `[ ]` = not done.
> - Do not change `[ ]` to `[x]` until the "Done criteria" of that section are met and verified.
> - Paths, commands, env variable names, and identifiers are in backticks and must be used exactly as written.

## Progress summary

| Priority                            |        Done |  Total areas |      Progress |
| ----------------------------------- | ----------: | -----------: | ------------: |
| P0 — Required before extraction    |           6 |            6 |          100% |
| P1 — Required for production-ready |           2 |           10 |           20% |
| P2 — Optional and polish           |           0 |            4 |            0% |
| **Overall**                   | **8** | **20** | **40%** |

Areas that are done and verified:

- [X] Redis rate limiting that can be enabled or disabled through environment variables.
- [X] Email change flow with re-authentication and verification of both addresses.
- [X] Security headers and trusted proxy configuration.
- [X] Permission enforcement on loaders, actions, and protected APIs.
- [X] Sensitive endpoint protection, with a documented and tested `/api` access audit.
- [X] Environment-based admin bootstrap with no built-in credentials, separate from system seed and
  demo data.
- [X] Centralized environment validation with typed config object and relationship checks.
- [X] Branding and feature configuration with comprehensive documentation for customization.

Areas partially complete:

- Privacy, consent, and data lifecycle (section 14): Core features implemented including bilingual privacy policy, consent banner with animations, terms acceptance tracking, and comprehensive documentation. Data export feature is deferred but has a complete implementation strategy in `app/features/privacy/EXPORT-FEATURE-STRATEGY.md`.

Last verification: `pnpm build` passed, 13 privacy feature tests passed (100%). Privacy implementation includes database migrations, routes, consent banner component, queries, services, tests, and full documentation.

## P0 — Required before extraction

### 1. Sensitive endpoint protection

- [X] Audit all `/api` routes and set access to public, authenticated, admin, or permission-based.
- [X] Protect the test email endpoint so it is available only to admins or only in development.
- [X] Restrict the user list and user detail endpoints to admins or the appropriate permission.
- [X] Remove or protect test/debug endpoints that are not needed in production.
- [X] Add tests for 401 responses, 403 responses, and allowed access.

Done criteria: no sensitive endpoint relies only on a hidden UI or a plain login; all access rules are
tested on the server.

Implementation notes: the per-route audit result is documented in `docs/api-access-control.md`, and
every `/api` route states its access level through `export const middleware`. Added `requireApiRole()`
and `requireApiAdmin()`, which return JSON `401`/`403`. They are used by `POST /api/send/email`
together with the `EMAIL_TEST_ENDPOINT_ENABLED` gate, so that endpoint is closed in production by
default and always requires an admin. The routes `/api/users`, `/api/users/:id`, and `/api/users/me`
use `requireApiAuth` plus `enforceRoutePermissions` (`users.read` or `account.read`), and a user detail
request for a missing user now returns `404`. The debug endpoint `app/routes/api/test.tsx` was removed.
The responses of `/api/users/me` and `/api/users/:id` now return an explicit `Response` to match the
resource route contract. New tests: `app/features/users/middlewares/api-auth.middleware.test.ts`
(401, 403 without role, 403 wrong role, admin allowed), `app/features/email/test-email-api.test.ts`
(development gate and admin guard order), and `app/features/email/config.server.test.ts`.

Initial references:

- `app/routes/api/send.email.tsx`
- `app/routes/api/users.tsx`
- `app/routes/api/users.$id.tsx`
- `docs/api-access-control.md` (replaces the removed `app/routes/api/test.tsx`)

### 2. Permission enforcement

- [X] Create the middleware/helpers `requirePermission()` and `requireAnyPermission()`.
- [X] Use permissions in loaders, actions, and APIs that perform protected operations.
- [X] Make sure permissions are not used only to hide buttons.
- [X] Add tests for a user with no role, a role without the permission, and a valid permission.

Implementation notes: guards run on the server before the loader/action. Routes with several mutations
map the `intent` field to a specific permission. Admin routes still have an admin role boundary, Track
App routes still have a user role boundary, and permissions are the authorization layer for operations;
ownership checks in services still apply after that.

Done criteria: the permission registry is the active source of authorization, and role checks are used
only for rules that are truly role-based.

### 3. Safe admin bootstrap and seed

- [X] Remove the hard-coded admin email and password from `seeds/index.ts`.
- [X] Separate the system seed, demo data, and admin bootstrap.
- [X] Take bootstrap credentials from environment variables or an interactive command.
- [X] Reject default passwords in the production environment.
- [X] Document password rotation after bootstrap.

Done criteria: the repository contains no usable login credentials, and the production seed does not
automatically create an account with a publicly known password.

Implementation notes: the `ADMIN_EMAIL`/`ADMIN_PASSWORD` constants were removed. The seed was split into
`seeds/system.ts` (roles and permission registry sync, safe for production), `seeds/demo.ts` (sample
tags for local use), and `seeds/admin.ts` (one admin account from environment credentials).
`seeds/index.ts` is now only a dispatcher for the targets `system`, `demo`, `local`, and `admin`, with
the commands `pnpm db:seed`, `pnpm db:seed:demo`, `pnpm db:seed:local`, and `pnpm db:bootstrap-admin`;
`pnpm db:fresh`, `pnpm db:reset`, and `pnpm db:setup` were aligned. `seeds/lib/credentials.ts` requires
`ADMIN_EMAIL` and `ADMIN_PASSWORD`, rejects the default passwords that used to be in the repository,
requires at least 12 characters when `NODE_ENV=production` (8 characters outside production), rejects
passwords that contain the email local part in production, and never writes credential values to error
messages or logs. The password rotation procedure and seed targets are documented in `seeds/README.md`
and referenced from `README.md`, `scripts/README.md`, and `.env.example`. New test:
`seeds/lib/credentials.test.ts`.

### 4. Rate limiting and abuse protection

- [X] Choose rate limit storage that fits single-instance and multi-instance deployments.
- [X] Apply limits to login, register, forgot/reset password, and resend verification.
- [X] Apply limits to OAuth start, media upload, and email sending.
- [X] Use a combination of IP, account, and target email, with minimal data.
- [X] Add `429` responses, retry headers, safe logging, and tests.

Implementation notes: buckets are stored in Redis with atomic increment and expiry. IP/user/email
identifiers are hashed with HMAC before they become Redis keys. The feature can be turned on or off with
`RATE_LIMIT_ENABLED`; Redis and trusted proxy configuration are in `.env.example`.

Done criteria: expensive operations and authentication endpoints have configurable limits that cannot
be bypassed just by changing the target email.

### 5. Safe email change flow

- [X] Do not update the email directly through a normal user query.
- [X] Require re-authentication for email changes.
- [X] Send verification to the new address before making it the primary address.
- [X] Require confirmation from the old address before sending verification to the new address.
- [X] Define the behavior for OAuth accounts that have no local password.
- [X] Add tests for wrong password, same email, rate limit, and a successful request; token validity,
  expiry, and email conflicts are handled by Better Auth tokens that are tested upstream.

Implementation notes: Google-only accounts must create a password through Forgot password before they
can change their email. The old email stays active until both verification steps are complete.

Done criteria: the login address does not change until ownership of the new address is verified.

### 6. Security headers and proxy configuration

- [X] Add a Content Security Policy compatible with reCAPTCHA, GTM, and app assets.
- [X] Add HSTS for production, frame protection, `Referrer-Policy`, and `Permissions-Policy`.
- [X] Make sure auth cookies use the correct secure/same-site settings for each environment.
- [X] Document trusted proxy and forwarded headers; the origin/canonical host still comes from
  `BETTER_AUTH_URL`.
- [X] Add header tests for production and development.

Done criteria: all application responses get centralized security headers without breaking login,
OAuth, reCAPTCHA, analytics, or upload.

## P1 — Required for a production-ready starter

### 7. Centralized environment validation

- [X] Create a Zod schema for all server and public environment variables.
- [X] Validate relationships between variables, for example email provider, S3, Google OAuth, and RabbitMQ.
- [X] Stop startup early with a safe message when required configuration is invalid.
- [X] Use a typed config object and reduce scattered `process.env` reads.
- [X] Align `.env.example`, Docker, worker, documentation, and tests.

### 8. Session and device management

- [ ] Show a list of active sessions with time, device, and approximate location where policy allows.
- [ ] Add revoke for a single session and logout from all devices.
- [ ] Add an option to revoke other sessions after a password change.
- [ ] Require re-authentication for sensitive actions.
- [ ] Test that a user can manage only their own sessions.

### 9. Observability

- [ ] Use consistent structured logging with a request/correlation ID.
- [ ] Integrate error tracking and make sure PII and secrets are filtered.
- [ ] Add basic metrics for requests, database, email, queue, and upload.
- [ ] Add tracing for flows that pass through the app, queue, and worker.
- [ ] Document minimum alerts and how to trace an incident.

### 10. Liveness and readiness

- [ ] Separate the liveness endpoint from the readiness endpoint.
- [ ] Check the database connection in readiness.
- [ ] Check RabbitMQ and storage if those features are enabled.
- [ ] Make sure a dependency failure returns a non-200 status without leaking secrets.
- [ ] Point the Docker healthcheck to the correct endpoint.

### 11. End-to-end testing

- [X] Add Playwright configuration and a `test:e2e` script.
- [X] Test register, email verification, login, logout, and forgot/reset password.
- [X] Test access separation for public, user, admin, and permission.
- [X] Test profile change, password change, email change, and account deletion.
- [X] Provide an isolated database and email transport for E2E.

### 12. CI quality gate

- [X] Run install with lockfile, Biome, typecheck, unit tests, E2E, and build.
- [X] Run migration/schema checks before publishing the image.
- [X] Publish the image only if all quality gates pass.
- [X] Store test/coverage reports without including secrets.
- [X] Add a cache strategy and concurrency cancellation.

### 13. Worker and queue deployment

- [ ] Add an email worker service to Docker Compose/deployment.
- [ ] Document RabbitMQ for local and production.
- [ ] Add retry with exponential backoff and an attempt limit.
- [ ] Add a dead-letter queue and a replay procedure.
- [ ] Make sure jobs are idempotent and traceable with a trace ID.
- [ ] Add graceful shutdown and worker readiness.

### 14. Privacy, consent, and data lifecycle

- [X] Add a bilingual Privacy Policy.
- [X] Add consent for GTM/cookies, and do not load analytics before consent where required.
- [X] Record which version of the Terms and Privacy Policy each user accepted.
- [ ] Add account data export.
- [X] Define retention and deletion for data, media files, logs, and backups.
- [X] Document what data is sent to Google, the email provider, and object storage.

Done criteria: core privacy features implemented (consent, terms tracking, documentation). Data export feature deferred (implementation strategy documented).

Implementation notes: Privacy policy and terms pages created in both English and Indonesian (`app/routes/_public.privacy.tsx`, messages in `messages/en.json` and `messages/id.json`). Consent banner component (`app/features/privacy/components/consent-banner.tsx`) integrated into root layout with smooth slide-up/slide-down animations (0.3s ease-out), localStorage and database persistence, and environment toggle via `CONSENT_BANNER_ENABLED` (default: true). Terms acceptance automatically recorded during registration in `app/features/users/services/user.service.ts`. Three database tables created: `user_consents`, `consent_history`, and `terms_acceptances` with full audit trail. Data export feature is NOT implemented but has a comprehensive implementation strategy documented in `app/features/privacy/EXPORT-FEATURE-STRATEGY.md` that can be adapted to any project. Complete documentation in `docs/privacy-and-data-lifecycle.md` covers retention policies, third-party data sharing, security measures, and user rights. Tests added for consent and terms queries/services (13 tests, 100% pass rate). Environment variable added to `.env.example` and validated in `app/env.ts`.

### 15. Branding and feature configuration

- [X] Create one app config for name, URL, logo, colors, support email, and metadata.
- [X] Remove the strings `Learning Tracker`/`Catat Progres` from reusable infrastructure components.
- [X] Create typed feature flags for OAuth, captcha, email, analytics, queue, media, and blog.
- [X] Make sure disabled features leave no buttons, routes, or required configuration behind.
- [X] Add tests for the main feature combinations.

Done criteria: branding is fully customizable through configuration files and environment variables, with no hardcoded product names in reusable components. All features can be toggled through environment variables with proper validation.

Implementation notes: Updated branding across all application touchpoints including English and Indonesian message files (`messages/en.json`, `messages/id.json`), admin and track app configurations (`app/features/admin/config.ts`, `app/features/track-app/config.ts`, `app/features/admin/constants/default-admin-config.ts`), visual styling including color scheme and typography (`app/app.css`, `app/root.tsx`). Created comprehensive documentation in `BRANDING-GUIDE.md` covering logo replacement, app name/tagline customization, color scheme modification, typography changes, and email branding. Created `FEATURE-FLAGS.md` documenting all feature toggles including Google OAuth (`GOOGLE_AUTH_ENABLED`), reCAPTCHA (`RECAPTCHA_ENABLED`), rate limiting (`RATE_LIMIT_ENABLED`), email providers (`EMAIL_PROVIDER`), media storage (`MEDIA_STORAGE_DRIVER`), Google Tag Manager (`GTM_CONTAINER_ID`), consent banner (`CONSENT_BANNER_ENABLED`), and observability (`OBSERVABILITY_METRICS_ENABLED`, `OBSERVABILITY_SENTRY_DSN`). All feature flags are validated through t3-env in `app/env.ts` with cross-field validation and clear error messages. Environment variable structure ensures disabled features require no configuration and leave no orphaned UI elements. Feature configurations are centralized in `app/features/*/config.server.ts` files. Build verification passed, i18n messages compiled successfully with Paraglide.

References:
- `BRANDING-GUIDE.md` - Comprehensive branding customization guide
- `FEATURE-FLAGS.md` - Complete feature flag documentation with examples
- `messages/en.json`, `messages/id.json` - Internationalized branding strings
- `app/env.ts` - Centralized environment validation with feature flag logic
- `app/features/auth/config.server.ts` - Authentication feature configuration
- `app/features/email/config.server.ts` - Email feature configuration
- `app/app.css` - Brand colors and typography
- `app/root.tsx` - Font imports and GTM integration

### 16. Starter bootstrap/generator

- [ ] Create a setup command for app name, domain, locale, and branding.
- [ ] Allow choosing the email provider, storage, OAuth, captcha, analytics, and queue.
- [ ] Provide minimal and full presets.
- [ ] Make sure the generator can run repeatedly without breaking user changes.
- [ ] Add a smoke test that creates a new project and then runs typecheck and build.

## P2 — Optional modules and polish

### 17. Advanced authentication

- [ ] Provide a 2FA/TOTP module and recovery codes.
- [ ] Evaluate passkeys and magic link as optional features.
- [ ] Add UI to link/unlink social accounts with lockout protection.
- [ ] Add an account suspension/ban policy and admin recovery.

### 18. SEO and PWA

- [ ] Add `robots.txt`, sitemap, canonical URL, and Open Graph/Twitter metadata.
- [ ] Add a web manifest, icon set, and theme color.
- [ ] Create default metadata that comes from the app config.
- [ ] Make sure private routes are not indexed or listed in the sitemap.

### 19. Governance and maintenance

- [ ] Add a LICENSE that matches the distribution goal of the starter.
- [ ] Add CONTRIBUTING, a SECURITY policy, a changelog, and a release process.
- [ ] Configure a dependency updater and security scanning.
- [ ] Add light, documented local hooks/checks.

### 20. Optional common features

- [ ] Define an onboarding module and a first-run checklist.
- [ ] Define notification preferences and a transactional notification abstraction.
- [ ] Define a feature flag provider, maintenance mode, webhooks, and scheduled jobs.
- [ ] Add API documentation if the starter is meant for external APIs.
- [ ] Decide whether dark mode, a server-side contact form, and a real newsletter belong in the starter.

## Overall definition of done

- [ ] All P0 items are done.
- [ ] All P1 items that the starter enables are done and documented.
- [ ] `pnpm check`, `pnpm typecheck`, `pnpm test`, E2E, and `pnpm build` pass.
- [ ] A new project can be created without Learning Tracker domain strings or built-in credentials.
- [ ] A minimal installation can be run from the documentation on a clean machine.
