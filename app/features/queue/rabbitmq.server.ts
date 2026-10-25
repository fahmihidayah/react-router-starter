import amqp, { type ChannelModel, type ConfirmChannel } from 'amqplib'
import { incrementQueueOperations } from '~/features/observability'
import { getRabbitMqConfig } from './config.server'

let connection: ChannelModel | undefined
let channel: ConfirmChannel | undefined

async function getChannel(): Promise<ConfirmChannel> {
  if (channel) return channel

  const config = getRabbitMqConfig()
  connection = await amqp.connect(config.url)
  connection.on('close', () => {
    connection = undefined
    channel = undefined
  })
  connection.on('error', () => {
    // The close event resets the cached connection. Callers receive operation errors.
  })

  channel = await connection.createConfirmChannel()
  channel.on('close', () => {
    channel = undefined
  })
  return channel
}

export type TEnqueueOptions = {
  messageId?: string
  type?: string
}

/**
 * Publishes a JSON payload to a durable queue and waits for broker confirmation.
 * The queue name is supplied by the caller so this feature has no knowledge of
 * what is being published. Returns `queued:<messageId>` so callers can correlate
 * the enqueue with later delivery.
 */
export async function enqueue(
  queue: string,
  payload: unknown,
  options: TEnqueueOptions = {},
): Promise<string> {
  const rabbitChannel = await getChannel()
  const messageId = options.messageId ?? crypto.randomUUID()

  try {
    await rabbitChannel.assertQueue(queue, { durable: true })
    const accepted = rabbitChannel.sendToQueue(queue, Buffer.from(JSON.stringify(payload)), {
      contentType: 'application/json',
      deliveryMode: 2,
      messageId,
      timestamp: Date.now(),
      ...(options.type === undefined ? {} : { type: options.type }),
    })

    if (!accepted) await new Promise<void>((resolve) => rabbitChannel.once('drain', resolve))
    await rabbitChannel.waitForConfirms()

    incrementQueueOperations('enqueue', queue, 'success')
    return `queued:${messageId}`
  } catch (error) {
    incrementQueueOperations('enqueue', queue, 'failure')
    throw error
  }
}
