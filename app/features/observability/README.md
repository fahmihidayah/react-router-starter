# Observability feature

This feature adds server-side observability to the application. It provides four capabilities that
share one request/trace context:

- **Structured logging** — a component-scoped logger that automatically attaches `requestId`,
  `traceId`, and `spanId` to every entry.
- **Metrics** — an in-process Prometheus registry for counters and histograms.
- **Error tracking** — best-effort delivery of unhandled errors to a Sentry endpoint.
- **Distributed tracing** — best-effort OTLP/HTTP span export.

Everything here is server-only. Import it through the feature barrel `~/features/observability`, not
from the individual `*.server.ts` files, unless you deliberately need a non-exported helper.

## How it is wired

The root middleware in `app/root.tsx` runs `observabilityMiddleware` first, ahead of security headers
and Paraglide:

```ts
export const middleware: MiddlewareFunction[] = [
  observabilityMiddleware,
  securityHeadersMiddleware,
  (ctx, next) => paraglideMiddleware(ctx.request, () => next()),
]
```

For every request the middleware:

1. Builds a context from the incoming `x-request-id` and W3C `traceparent` headers (or generates new
   IDs when they are missing or malformed).
2. Runs the rest of the request inside `runWithObservabilityContext`, so downstream loggers, spans,
   and error reports can read the same IDs.
3. Adds `X-Request-ID` and `traceparent` to the outgoing response headers.
4. Emits `app_http_requests_total` and `app_http_request_duration_ms`, plus `Request started` and
   `Request completed` log lines.
5. Logs `Request failed` and calls `reportError` for unexpected (non-`Response`) errors.

Route paths are normalized before they are used as metric labels: UUID and purely numeric segments
become `:id`, for example `/api/users/123` → `/api/users/:id`.

## Public API

The barrel `app/features/observability/index.ts` exports:

| Export | Purpose |
| --- | --- |
| `observabilityMiddleware` | Root request middleware (already registered). |
| `createServerLogger(component)` | Component-scoped logger with context injection. |
| `getObservabilityContext()` | Current `{ requestId, traceId, spanId, parentSpanId? }`, or `undefined`. |
| `runWithObservabilityContext(context, callback)` | Run code with an explicit context. |
| `createRequestContext(request)` | Build a context from a `Request`. |
| `createWorkerContext(traceparent?, requestId?)` | Build a context for background workers. |
| `formatTraceparent(context?)` | Format the current context as a W3C `traceparent` value. |
| `startSpan(name, callback, attributes?)` | Wrap async work in a span. |
| `incrementCounter(name, help, labels?, amount?)` | Increment a counter. |
| `observeHistogram(name, help, value, labels?, buckets?)` | Record a histogram observation. |
| `renderPrometheusMetrics()` | Render the registry as Prometheus text exposition format. |
| `reportError(error, metadata?)` | Send an error to the configured Sentry endpoint. |
| `getObservabilityConfig()` | Read and validate observability configuration. |

## Logging

Wrap the shared logger with `createServerLogger` and log normally. Context fields are merged into the
structured entry automatically and never leak secrets, because the underlying logger redacts
sensitive keys.

```ts
import { createServerLogger } from '~/features/observability'

const logger = createServerLogger('Goals')

logger.info('Goal created', { goalId, learnerId })
logger.warn('Goal limit reached', { learnerId })
logger.error('Goal creation failed', error)
```

Prefer passing identifiers and small scalars. Do not log tokens, cookies, passwords, DSNs, or full
recipient addresses.

## Tracing

`startSpan` creates a child span, runs the callback inside a new context, and exports it over OTLP
when an endpoint is configured.

```ts
import { startSpan } from '~/features/observability'

const result = await startSpan('report.export', () => buildReport(input), {
  'report.format': 'csv',
})
```

Key behaviors:

- When there is no active context, `startSpan` is a pass-through: it runs the callback and creates no
  span. Spans therefore require the middleware (or `runWithObservabilityContext`) to have run first.
- When `OBSERVABILITY_OTLP_TRACES_ENDPOINT` is unset, spans are still created and logged in
  development but nothing is exported.
- Exports use a 2 second timeout and never throw; failures are logged as `OTLP span export failed`.
- The email feature propagates context across the queue using `formatTraceparent()` on the job and
  `createWorkerContext(traceparent)` inside a worker, so spans stay linked end-to-end.

Consumers that cross a process boundary should forward `formatTraceparent()` in the payload and
rebuild the context in the worker with `createWorkerContext`.

## Metrics

The registry is an in-memory `Map`, so metrics live and die with the process. `incrementCounter` and
`observeHistogram` are safe to call anywhere on the server.

```ts
import { incrementCounter, observeHistogram } from '~/features/observability'

incrementCounter('app_learning_records_total', 'Learning records created', {
  source: 'pomodoro',
})

observeHistogram('app_report_duration_ms', 'Report build duration in milliseconds', durationMs, {
  kind: 'weekly',
})
```

Rules:

- A metric name must keep the same type (counter or histogram) for the lifetime of the process;
  changing it throws.
- Labels are sorted and stringified, so label order does not matter.
- The default histogram buckets are in milliseconds:
  `5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000`.

Existing metric names and labels:

| Metric | Type | Labels |
| --- | --- | --- |
| `app_http_requests_total` | counter | `method`, `route`, `status` |
| `app_http_request_duration_ms` | histogram | `method`, `route` |
| `app_database_queries_total` | counter | `operation` |
| `app_database_connections_closed_total` | counter | — |
| `app_email_operations_total` | counter | `operation`, `status`, `template`, `provider` |
| `app_email_duration_ms` | histogram | `provider`, `template` |
| `app_queue_operations_total` | counter | `operation`, `queue`, `status` |
| `app_error_reports_total` | counter | `status` |

### Exposing metrics

`renderPrometheusMetrics()` returns a Prometheus text payload, but **no route currently serves it**.
Add a scrape endpoint and protect it with the metrics token. A minimal example:

```ts
// app/routes/api/metrics.tsx
import { getObservabilityConfig, renderPrometheusMetrics } from '~/features/observability'

export async function loader({ request }: { request: Request }) {
  const config = getObservabilityConfig()
  if (!config.metrics.enabled) throw new Response('Not Found', { status: 404 })

  if (config.metrics.token) {
    const authorization = request.headers.get('authorization')
    if (authorization !== `Bearer ${config.metrics.token}`) {
      throw new Response('Unauthorized', { status: 401 })
    }
  }

  return new Response(renderPrometheusMetrics(), {
    headers: { 'Content-Type': 'text/plain; version=0.0.4; charset=utf-8' },
  })
}
```

Because React Router route modules are bundled into the server build, this stays server-only. Scrape
this path with Prometheus and point alerts at the counters and histograms above. In production,
`OBSERVABILITY_METRICS_ENABLED=true` requires `OBSERVABILITY_METRICS_TOKEN`, so the endpoint must
always be token-guarded there.

## Error tracking

`observabilityMiddleware` calls `reportError` for unexpected errors. You can also report errors
explicitly from services, loaders, or actions:

```ts
import { reportError } from '~/features/observability'

try {
  await runReport(input)
} catch (error) {
  await reportError(error, { method: 'POST', route: '/track-app/reports' })
  throw error
}
```

Behavior:

- When `OBSERVABILITY_SENTRY_DSN` is unset, `reportError` returns immediately (no network call).
- Metadata values must be `string`, `number`, `boolean`, or `undefined`.
- The event includes the environment, release, derived trace/request IDs, and the error stack.
- Delivery is best-effort with a 2 second timeout. Success and failure both increment
  `app_error_reports_total` with a `status` label. Delivery failures are logged, never thrown.

## Configuration

All variables are optional and validated by Zod in `config.server.ts`. Invalid values throw an
`Invalid observability configuration` error.

| Variable | Required | Notes |
| --- | --- | --- |
| `OBSERVABILITY_METRICS_ENABLED` | no | `true` to enable metric serving. Defaults to `false`. |
| `OBSERVABILITY_METRICS_TOKEN` | conditional | Minimum 16 characters. Required in production when metrics are enabled. |
| `OBSERVABILITY_SENTRY_DSN` | no | Sentry DSN. Enables error tracking when set. |
| `OBSERVABILITY_OTLP_TRACES_ENDPOINT` | no | OTLP/HTTP traces endpoint. Enables span export when set. |
| `OBSERVABILITY_OTLP_AUTH_HEADER` | no | Sent verbatim as the `Authorization` header for span export. |
| `OBSERVABILITY_ENVIRONMENT` | no | Overrides the environment tag; falls back to `NODE_ENV`. |
| `OBSERVABILITY_RELEASE` | no | Release/version string attached to traces and error reports. |

Example:

```env
OBSERVABILITY_METRICS_ENABLED=true
OBSERVABILITY_METRICS_TOKEN=replace-with-a-long-random-token
OBSERVABILITY_SENTRY_DSN=https://public-key@o0.ingest.sentry.io/0000000
OBSERVABILITY_OTLP_TRACES_ENDPOINT=https://otlp.example.com/v1/traces
OBSERVABILITY_OTLP_AUTH_HEADER=Bearer your-collector-token
OBSERVABILITY_ENVIRONMENT=production
OBSERVABILITY_RELEASE=2026.10.12
```

Reading configuration is cheap and safe to call per request:

```ts
import { getObservabilityConfig } from '~/features/observability'

const { metrics, tracing, sentryDsn } = getObservabilityConfig()
```

## Enabling capabilities at a glance

- **Logging only (default):** do nothing. The middleware and loggers are always active.
- **Metrics:** set `OBSERVABILITY_METRICS_ENABLED=true` and add a scrape route (see above).
- **Error tracking:** set `OBSERVABILITY_SENTRY_DSN`.
- **Tracing:** set `OBSERVABILITY_OTLP_TRACES_ENDPOINT` (add `OBSERVABILITY_OTLP_AUTH_HEADER` if your
  collector needs it).

## Files

- `config.server.ts` — Zod validation and `getObservabilityConfig`
- `context.server.ts` — AsyncLocalStorage context, ID generation, `traceparent` parsing
- `logger.server.ts` — `createServerLogger` with context injection and redaction
- `metrics.server.ts` — Prometheus registry, counters, histograms, rendering
- `error-tracking.server.ts` — Sentry envelope delivery
- `tracing.server.ts` — span creation and OTLP export
- `observability.middleware.ts` — root request middleware and route normalization
- `index.ts` — public barrel

## Related documentation

- [`AGENTS.md`](../../../AGENTS.md) — repository conventions, including logging and secret handling.
- [`DEBUGGING.md`](../../../DEBUGGING.md) — where to start when investigating a failure.
