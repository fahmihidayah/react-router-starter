import amqp from 'amqplib'
import { env } from '~/env'

export type RabbitMqHealthResult = {
  healthy: boolean
  error?: string
}

/**
 * Check RabbitMQ connectivity.
 * Returns a safe result object without exposing sensitive connection details.
 * Only runs if EMAIL_DELIVERY_MODE is 'rabbitmq'.
 */
export async function checkRabbitMqHealth(): Promise<RabbitMqHealthResult> {
  // Skip check if RabbitMQ is not configured for email delivery
  if (env.EMAIL_DELIVERY_MODE !== 'rabbitmq') {
    return { healthy: true } // Not applicable, consider it healthy
  }

  if (!env.RABBITMQ_URL) {
    return {
      healthy: false,
      error: 'not_configured',
    }
  }

  try {
    // Create a temporary connection just for health check
    const connection = await amqp.connect(env.RABBITMQ_URL)

    // Try to create a channel to verify the connection works
    const channel = await connection.createChannel()
    await channel.close()
    await connection.close()

    return { healthy: true }
  } catch (_error) {
    // Return generic error without leaking connection details
    return {
      healthy: false,
      error: 'connection_failed',
    }
  }
}
