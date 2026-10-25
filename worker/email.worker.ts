import 'dotenv/config'
import amqp from 'amqplib'
import { getEmailQueueName } from '../app/features/email/config.server'
import { deliverEmail } from '../app/features/email/email-delivery.server'
import { isEmailJob } from '../app/features/email/email-job'
import { getRabbitMqConfig } from '../app/features/queue/config.server'

const config = getRabbitMqConfig()
const queueName = getEmailQueueName()
const connection = await amqp.connect(config.url)
const channel = await connection.createChannel()

await channel.assertQueue(queueName, { durable: true })
await channel.prefetch(config.prefetch)

console.log(`[EmailWorker] Listening on queue "${queueName}"`)

await channel.consume(queueName, async (message) => {
  if (!message) return

  let value: unknown
  try {
    value = JSON.parse(message.content.toString())
  } catch {
    console.error('[EmailWorker] Discarding a message with invalid JSON')
    channel.nack(message, false, false)
    return
  }

  if (!isEmailJob(value)) {
    console.error('[EmailWorker] Discarding an invalid email job')
    channel.nack(message, false, false)
    return
  }

  try {
    const messageId = await deliverEmail(value.to, value.email, value.template, value.traceId)
    channel.ack(message)
    console.log('[EmailWorker] Email delivered', { traceId: value.traceId, messageId })
  } catch (error) {
    console.error('[EmailWorker] Email delivery failed', {
      traceId: value.traceId,
      requeue: config.requeueOnFailure,
      error: error instanceof Error ? error.message : String(error),
    })
    channel.nack(message, false, config.requeueOnFailure)
  }
})

async function shutdown(signal: string) {
  console.log(`[EmailWorker] ${signal} received, shutting down`)
  await channel.close()
  await connection.close()
  process.exit(0)
}

process.once('SIGINT', () => void shutdown('SIGINT'))
process.once('SIGTERM', () => void shutdown('SIGTERM'))
