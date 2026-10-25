# Queue feature

This feature owns the RabbitMQ integration: connection management, durable queue publishing, and the
connection settings shared by the app (publisher) and the worker (consumer). It is intentionally
generic so any feature can publish jobs to its own queue without depending on another feature's
domain types.

## Files

- `config.server.ts` - RabbitMQ connection settings (`RABBITMQ_URL`, `RABBITMQ_PREFETCH`,
  `RABBITMQ_REQUEUE_ON_FAILURE`)
- `rabbitmq.server.ts` - lazy publisher with a cached confirm channel and
  `enqueue(queue, payload, options)`
- `index.server.ts` - public barrel

## Usage

```ts
import { enqueue } from '~/features/queue/index.server'

const messageId = await enqueue('emails', { to: 'learner@example.com' }, {
  messageId: traceId,
  type: 'email.send',
})
```

The queue name is supplied by the caller, so the queue feature has no knowledge of what is being
published. Email is one consumer of this feature; its queue name lives in the email feature's own
configuration (`EMAIL_QUEUE_NAME`).
