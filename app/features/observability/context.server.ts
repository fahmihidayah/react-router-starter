import { AsyncLocalStorage } from 'node:async_hooks'
import { randomBytes, randomUUID } from 'node:crypto'

export type ObservabilityContext = {
  requestId: string
  traceId: string
  spanId: string
}

const storage = new AsyncLocalStorage<ObservabilityContext>()
const REQUEST_ID_PATTERN = /^[a-zA-Z0-9._:-]{1,128}$/

export function getRequestId(request: Request): string {
  const candidate = request.headers.get('x-request-id')?.trim()
  return candidate && REQUEST_ID_PATTERN.test(candidate) ? candidate : randomUUID()
}

export function parseTraceparent(
  value: string | null,
): Pick<ObservabilityContext, 'traceId' | 'spanId'> | undefined {
  if (!value) return undefined
  const match = /^00-([0-9a-f]{32})-([0-9a-f]{16})-[0-9a-f]{2}$/i.exec(value.trim())
  if (!match) return undefined

  const traceId = match[1].toLowerCase()
  const spanId = match[2].toLowerCase()
  if (/^0+$/.test(traceId) || /^0+$/.test(spanId)) return undefined
  return { traceId, spanId }
}

function createContext(requestId: string, traceparent: string | null): ObservabilityContext {
  const parent = parseTraceparent(traceparent)
  return {
    requestId,
    traceId: parent?.traceId ?? randomBytes(16).toString('hex'),
    spanId: parent?.spanId ?? randomBytes(8).toString('hex'),
  }
}

export function createRequestContext(request: Request): ObservabilityContext {
  return createContext(getRequestId(request), request.headers.get('traceparent'))
}

export function createWorkerContext(
  traceparent?: string,
  requestId?: string,
): ObservabilityContext {
  const validRequestId = requestId && REQUEST_ID_PATTERN.test(requestId) ? requestId : randomUUID()
  return createContext(validRequestId, traceparent ?? null)
}

export function getObservabilityContext(): ObservabilityContext | undefined {
  return storage.getStore()
}

export function runWithObservabilityContext<T>(
  context: ObservabilityContext,
  callback: () => T,
): T {
  return storage.run(context, callback)
}

export function formatTraceparent(context = getObservabilityContext()): string | undefined {
  return context ? `00-${context.traceId}-${context.spanId}-01` : undefined
}
