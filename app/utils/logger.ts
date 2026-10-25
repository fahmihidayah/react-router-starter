/**
 * Logger utility for easier debugging
 *
 * Usage:
 * import { logger } from '~/utils/logger';
 *
 * logger.info('Component', 'Action description', { data });
 * logger.warn('Component', 'Warning message', { details });
 * logger.error('Component', 'Error occurred', error);
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

const SENSITIVE_KEY = /^(authorization|cookie|dsn|password|passwd|secret|token|api[-_]?key)$/i

function sanitize(value: unknown, seen = new WeakSet<object>()): unknown {
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack }
  }
  if (!value || typeof value !== 'object') return value
  if (seen.has(value)) return '[Circular]'
  seen.add(value)
  if (Array.isArray(value)) return value.map((item) => sanitize(item, seen))

  return Object.fromEntries(
    Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_KEY.test(key) ? '[REDACTED]' : sanitize(item, seen),
    ]),
  )
}

class Logger {
  private isDev = import.meta.env?.DEV ?? process.env.NODE_ENV !== 'production'
  private isEnabled = true

  /**
   * Enable or disable logging
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
  }

  /**
   * Log info message
   */
  info(component: string, message: string, data?: unknown) {
    this.log('info', component, message, data)
  }

  /**
   * Log warning message
   */
  warn(component: string, message: string, data?: unknown) {
    this.log('warn', component, message, data)
  }

  /**
   * Log error message
   */
  error(component: string, message: string, error?: unknown) {
    this.log('error', component, message, error)
  }

  /**
   * Log debug message (only in development)
   */
  debug(component: string, message: string, data?: unknown) {
    if (this.isDev) {
      this.log('debug', component, message, data)
    }
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, component: string, message: string, data?: unknown) {
    if (!this.isEnabled) return

    const entry = JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      component,
      message,
      ...(data === undefined ? undefined : { data: sanitize(data) }),
    })

    if (level === 'error') console.error(entry)
    else if (level === 'warn') console.warn(entry)
    else if (level === 'debug') console.debug(entry)
    else console.info(entry)
  }

  /**
   * Create a scoped logger for a specific component
   */
  scope(component: string) {
    return {
      info: (message: string, data?: unknown) => this.info(component, message, data),
      warn: (message: string, data?: unknown) => this.warn(component, message, data),
      error: (message: string, error?: unknown) => this.error(component, message, error),
      debug: (message: string, data?: unknown) => this.debug(component, message, data),
    }
  }

  /**
   * Log API request
   */
  apiRequest(method: string, url: string, data?: unknown) {
    this.debug('API', `${method} ${url}`, data)
  }

  /**
   * Log API response
   */
  apiResponse(method: string, url: string, status: number, data?: unknown) {
    const level = status >= 400 ? 'error' : status >= 200 && status < 300 ? 'info' : 'warn'
    this.log(level, 'API', `${method} ${url} → ${status}`, data)
  }
}

export const logger = new Logger()

// Create common component loggers
export const authLogger = logger.scope('Auth')
export const apiLogger = logger.scope('API')
export const routeLogger = logger.scope('Route')
