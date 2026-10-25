import { env } from '~/env'

export type TRabbitMqConfig = {
  prefetch: number
  requeueOnFailure: boolean
  url: string
}

export function getRabbitMqConfig(): TRabbitMqConfig {
  const url = env.RABBITMQ_URL
  if (!url) throw new Error('RABBITMQ_URL is required for the RabbitMQ connection')

  return {
    prefetch: env.RABBITMQ_PREFETCH,
    requeueOnFailure: env.RABBITMQ_REQUEUE_ON_FAILURE,
    url,
  }
}
