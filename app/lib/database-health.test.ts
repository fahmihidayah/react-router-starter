import { sql } from 'drizzle-orm'
import { describe, expect, it, vi } from 'vitest'
import * as database from './database'
import { checkDatabaseHealth } from './database-health'

vi.mock('./database', () => ({
  db: {
    execute: vi.fn(),
  },
}))

describe('checkDatabaseHealth', () => {
  it('returns healthy when database query succeeds', async () => {
    vi.mocked(database.db.execute).mockResolvedValue(undefined as never)

    const result = await checkDatabaseHealth()

    expect(result.healthy).toBe(true)
    expect(result.latencyMs).toBeGreaterThanOrEqual(0)
    expect(result.error).toBeUndefined()
    expect(database.db.execute).toHaveBeenCalledWith(sql`SELECT 1`)
  })

  it('returns unhealthy when database query fails', async () => {
    vi.mocked(database.db.execute).mockRejectedValue(new Error('Connection refused'))

    const result = await checkDatabaseHealth()

    expect(result.healthy).toBe(false)
    expect(result.error).toBe('connection_failed')
    expect(result.latencyMs).toBeUndefined()
  })

  it('does not leak connection details in error', async () => {
    vi.mocked(database.db.execute).mockRejectedValue(
      new Error('Failed to connect to postgres://user:password@host:5432/db'),
    )

    const result = await checkDatabaseHealth()

    expect(result.healthy).toBe(false)
    expect(result.error).toBe('connection_failed')
    // Should not contain connection string
    expect(JSON.stringify(result)).not.toContain('postgres://')
    expect(JSON.stringify(result)).not.toContain('password')
  })

  it('measures query latency', async () => {
    vi.mocked(database.db.execute).mockImplementation(
      () =>
        new Promise<never>((resolve) => {
          setTimeout(() => resolve(undefined as never), 10)
        }) as never,
    )

    const result = await checkDatabaseHealth()

    expect(result.healthy).toBe(true)
    expect(result.latencyMs).toBeGreaterThanOrEqual(10)
  })
})
