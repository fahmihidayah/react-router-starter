# Todo: Production-Ready Audit Log

Currently the audit log stores only `actorId`, `entityType`, `entityId`, and `createdAt`. The service
`record()` is also not yet called by any application operation. The goal of this document is to make
the audit log useful for security investigation without turning it into a store of sensitive data.

> **Implementation Status:** Not started. Basic schema exists but no integration.
>
> **Current State:**
> - ✅ Basic table schema exists: `app/features/audit-log/schemas/db/audit-logs.ts`
> - ✅ Service skeleton exists: `app/features/audit-log/services/audit-log.service.ts`
> - ✅ Basic queries exist: `app/features/audit-log/queries/index.ts`
> - ❌ No actual audit logging calls in application code
> - ❌ No tests for audit log functionality
> - ❌ Only referenced in user deletion cleanup (app/features/users/queries/delete.ts:49)
> - ⚠️ One extension example: `auditLogTemplates` for learning templates (not actively used)

> Agent notes:
> - `[ ]` = not done. Change to `[x]` only after the phase's "Done criteria" are met and verified.
> - Work in phase order. Phase 1 decisions drive the later phases.
> - Code identifiers, paths, and commands are in backticks and must be used exactly as written.

## Phase 1 — Set the policy

- [ ] List the events that must be audited: account changes, email/password, session revoke,
      admin user/role/permission changes, media, configuration, export, and data deletion.
- [ ] Distinguish security audit, administration audit, and domain activity history.
- [ ] Define retention, reader access, export needs, and the deletion/anonymization procedure.
- [ ] Decide whether the audit must be immutable and who may delete it.

Done criteria: there is a written decision on events, access, retention, and privacy.

## Phase 2 — Extend the schema

- [ ] Add `action` with a stable vocabulary, for example `user.role.updated`.
- [ ] Add `outcome`: `success`, `failure`, or `denied`.
- [ ] Add `targetType` and `targetId`, or document how the current entity fields are used.
- [ ] Add `requestId`/`traceId` for correlation.
- [ ] Add a nullable `metadata` JSONB column that is validated and size-limited.
- [ ] Add a nullable actor or an actor type for system/worker events.
- [ ] Consider `ipHash` or an IP prefix instead of the raw IP, according to the privacy policy.
- [ ] Store a truncated/normalized user-agent only if it is truly needed.
- [ ] Add indexes on action, outcome, target, actor, request ID, and time.

Done criteria: the PostgreSQL migration is generated, the SQL is reviewed, and old data stays valid.

## Phase 3 — Metadata sanitization

- [ ] Create a per-event metadata allowlist; do not accept raw request objects.
- [ ] Forbid passwords, tokens, cookies, authorization headers, captcha responses, API keys, and email
      content.
- [ ] Mask email addresses and sensitive identifiers when the full value is not needed.
- [ ] Limit depth, number of keys, string length, and total JSON size.
- [ ] Add tests that prove secrets and sensitive payloads are not stored.

Done criteria: metadata contains only approved fields and has size limits.

## Phase 4 — Consistent service API

- [ ] Replace the `record()` API with a typed input that contains action, outcome, actor, target, and
      context.
- [ ] Provide helpers for success, failure, denied, system, and worker events.
- [ ] Support transactions so that a data change and an important audit entry can be written atomically.
- [ ] Define the behavior when an audit write fails; a critical operation must not be silently treated
      as successful.
- [ ] Add a correlation ID from the request through to the background worker.

Done criteria: routes and services do not build audit rows manually.

## Phase 5 — Integrate sensitive operations

- [ ] Registration, email verification, important login failures, forgot/reset password, and account
      recovery.
- [ ] Profile/email/password changes, session revoke, and account deletion.
- [ ] Admin create/update/delete of users and role changes.
- [ ] Create/update/delete of roles and permission assignment.
- [ ] Media upload/update/delete and bulk delete.
- [ ] Data export and application configuration changes.
- [ ] Worker events: email delivered, retry exhausted, and dead-lettered, without storing email content.

Done criteria: every event in the Phase 1 policy has an integration point and a test.

## Phase 6 — Query and admin viewer

- [ ] Paginated queries with filters for time, actor, action, outcome, and target.
- [ ] A dedicated permission to read or export the audit log.
- [ ] A read-only admin viewer showing sanitized metadata details.
- [ ] Redact identifiers based on role and privacy policy.
- [ ] Export is limited, recorded as an audit event, and not available through a permanent public URL.

Done criteria: the audit can be traced without giving edit access or exposing excessive PII.

## Phase 7 — Retention and integrity

- [ ] Create a retention/archive job with dry-run and batch limits.
- [ ] Decide the archive storage and encryption if long retention is needed.
- [ ] Consider append-only database permissions or a tamper-evidence mechanism.
- [ ] Monitor table growth, write failures, and archive backlog.

Done criteria: audit volume is under control and ordinary application users cannot change entries.

## Phase 8 — Verification

- [ ] Unit tests for the metadata schema and sanitizer.
- [ ] Service tests for success, failure, denied, system actor, and transaction rollback.
- [ ] Integration tests that a sensitive operation produces exactly one correct event.
- [ ] Authorization tests for the viewer and export.
- [ ] Run `pnpm check`, `pnpm typecheck`, the related tests, and the migration check.

## Current code references

- `app/features/audit-log/schemas/db/audit-logs.ts`
- `app/features/audit-log/services/audit-log.service.ts`
- `app/features/audit-log/queries/index.ts`
