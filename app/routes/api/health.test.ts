import { describe, expect, it } from 'vitest'
import { loader } from './health'

describe('/api/health (liveness)', () => {
  it('returns 200 with ok status', async () => {
    const response = await loader()

    expect(response).toBeInstanceOf(Response)
    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('application/json')
  })

  it('includes timestamp and uptime', async () => {
    const response = await loader()
    const data = await response.json()

    expect(data).toMatchObject({
      status: 'ok',
      timestamp: expect.any(String),
      uptime: expect.any(Number),
    })
    expect(data.uptime).toBeGreaterThan(0)
  })

  it('returns valid ISO 8601 timestamp', async () => {
    const response = await loader()
    const data = await response.json()

    const timestamp = new Date(data.timestamp)
    expect(timestamp.toISOString()).toBe(data.timestamp)
  })
})
