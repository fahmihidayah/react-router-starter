import { afterEach, describe, expect, it } from 'vitest'
import { getRabbitMqConfig } from './config.server'

describe('getRabbitMqConfig', () => {
  const originalEnv = { ...process.env }

  afterEach(() => {
    process.env = { ...originalEnv }
  })

  it('reads the URL, prefetch, and requeue policy', () => {
    process.env.RABBITMQ_URL = 'amqp://localhost'
    process.env.RABBITMQ_PREFETCH = '10'
    process.env.RABBITMQ_REQUEUE_ON_FAILURE = 'true'

    expect(getRabbitMqConfig()).toEqual({
      prefetch: 10,
      requeueOnFailure: true,
      url: 'amqp://localhost',
    })
  })

  it('applies defaults when optional settings are omitted', () => {
    process.env.RABBITMQ_URL = 'amqp://localhost'
    delete process.env.RABBITMQ_PREFETCH
    delete process.env.RABBITMQ_REQUEUE_ON_FAILURE

    expect(getRabbitMqConfig()).toEqual({
      prefetch: 5,
      requeueOnFailure: false,
      url: 'amqp://localhost',
    })
  })

  it('requires a connection URL', () => {
    delete process.env.RABBITMQ_URL

    expect(() => getRabbitMqConfig()).toThrow(/RABBITMQ_URL/)
  })
})
