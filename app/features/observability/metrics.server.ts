import * as promClient from 'prom-client'

const { register } = promClient

// Collect default metrics (process_cpu_seconds_total, nodejs_eventloop_lag_seconds, etc.)
// Guard against hot reload: only collect once
if (register.getSingleMetric('process_cpu_user_seconds_total') === undefined) {
  promClient.collectDefaultMetrics()
}

const HISTOGRAM_BUCKETS = [5, 10, 25, 50, 100, 250, 500, 1_000, 2_500, 5_000, 10_000]

// Guard against hot reload: check if metric already exists before creating
function getOrCreateCounter(
  name: string,
  help: string,
  labelNames: string[],
): promClient.Counter<string> {
  const existing = register.getSingleMetric(name)
  if (existing) return existing as promClient.Counter<string>
  return new promClient.Counter({ name, help, labelNames })
}

function getOrCreateHistogram(
  name: string,
  help: string,
  labelNames: string[],
  buckets: number[],
): promClient.Histogram<string> {
  const existing = register.getSingleMetric(name)
  if (existing) return existing as promClient.Histogram<string>
  return new promClient.Histogram({ name, help, labelNames, buckets })
}

// HTTP metrics
const httpRequestsTotal = getOrCreateCounter(
  'app_http_requests_total',
  'HTTP requests handled by the application',
  ['method', 'route', 'status'],
)

const httpRequestDurationMs = getOrCreateHistogram(
  'app_http_request_duration_ms',
  'HTTP request duration in milliseconds',
  ['method', 'route'],
  HISTOGRAM_BUCKETS,
)

// Database metrics
const databaseQueriesTotal = getOrCreateCounter(
  'app_database_queries_total',
  'Database queries issued by operation',
  ['operation'],
)

const databaseConnectionsClosedTotal = getOrCreateCounter(
  'app_database_connections_closed_total',
  'Database connections closed',
  [],
)

// Email metrics
const emailOperationsTotal = getOrCreateCounter(
  'app_email_operations_total',
  'Email operations by result',
  ['operation', 'status', 'template', 'provider'],
)

const emailDurationMs = getOrCreateHistogram(
  'app_email_duration_ms',
  'Email delivery duration in milliseconds',
  ['provider', 'template'],
  HISTOGRAM_BUCKETS,
)

// Queue metrics
const queueOperationsTotal = getOrCreateCounter(
  'app_queue_operations_total',
  'Queue operations by result',
  ['operation', 'queue', 'status'],
)

// Error tracking metrics
const errorReportsTotal = getOrCreateCounter(
  'app_error_reports_total',
  'Error tracking delivery attempts',
  ['status'],
)

export function incrementHttpRequests(method: string, route: string, status: string): void {
  httpRequestsTotal.inc({ method, route, status })
}

export function observeHttpDuration(method: string, route: string, durationMs: number): void {
  httpRequestDurationMs.observe({ method, route }, durationMs)
}

export function incrementDatabaseQueries(operation: string): void {
  databaseQueriesTotal.inc({ operation })
}

export function incrementDatabaseConnectionsClosed(): void {
  databaseConnectionsClosedTotal.inc()
}

export function incrementEmailOperations(
  operation: string,
  status: string,
  template: string,
  provider: string,
): void {
  emailOperationsTotal.inc({ operation, status, template, provider })
}

export function observeEmailDuration(provider: string, template: string, durationMs: number): void {
  emailDurationMs.observe({ provider, template }, durationMs)
}

export function incrementQueueOperations(operation: string, queue: string, status: string): void {
  queueOperationsTotal.inc({ operation, queue, status })
}

export function incrementErrorReports(status: string): void {
  errorReportsTotal.inc({ status })
}

export function renderMetrics(): Promise<string> {
  return register.metrics()
}

export function metricsContentType(): string {
  return register.contentType
}

export function resetMetricsForTests(): void {
  register.clear()
}
