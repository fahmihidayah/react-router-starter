# Email feature

This feature sends the authentication emails used by Better Auth:

- Password reset
- Email verification
- Account activation after public registration

Every template supports English (`en`) and Indonesian (`id`). Register, forgot-password, and resend
verification actions forward the active Paraglide locale to Better Auth, and the email callback uses
that locale for the subject, HTML body, shared footer, and plain-text alternative. English is the
safe fallback when a request has no supported locale.

Sign-up requests use the account-activation template. Resend verification and other verification
requests use the email-verification template.

`Nodemailer` handles SMTP delivery, `Resend` handles API delivery, and `Handlebars` renders the small HTML templates. Templates use
Tailwind CSS utilities, which are converted to email-compatible inline styles by `Juice` before
delivery. The shared layout keeps the header, icon, colors, Plus Jakarta Sans font stack, and footer
consistent.

## Files

- `templates/layout.html` - shared branded wrapper
- `templates/password-reset.html` - password reset content
- `templates/email-verification.html` - verification link/code content
- `templates/account-activation.html` - activation email sent after the register form succeeds
- `email-tailwind.server.ts` - Tailwind theme and app font shared by every email template
- `template-renderer.server.ts` - safe placeholder rendering and plain-text alternatives
- `email-service.server.ts` - template rendering and direct/queued dispatch
- `email-delivery.server.ts` - SMTP and Resend delivery providers
- `worker/email.worker.ts` - RabbitMQ email consumer
- `config.server.ts` - email environment configuration
- `app/features/queue` - generic RabbitMQ connection and publishing

## Placeholders

The templates support the recipient name and email, expiry time, action URL, and an optional
verification code. Handlebars escapes placeholder values by default.

The public register form creates accounts through Better Auth's `signUpEmail` endpoint. Its
`sendOnSignUp` always renders and dispatches the account activation template when email delivery is
configured. Users created through the admin API do not trigger this registration email.

## Configuration

Copy the email settings from `.env.example`. Existing SMTP behavior remains the default:

```env
EMAIL_PROVIDER=smtp
EMAIL_DELIVERY_MODE=direct
SMTP_HOST=localhost
EMAIL_FROM=no-reply@example.com
```

Port `465` normally uses `SMTP_SECURE=true`; STARTTLS ports such as `587` normally use
`SMTP_SECURE=false`.

To send directly with Resend instead:

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=no-reply@your-verified-domain.example
```

`EMAIL_FROM` must use a sender/domain allowed by the selected provider.

## RabbitMQ worker

Set `EMAIL_DELIVERY_MODE=rabbitmq` and `RABBITMQ_URL` in both the app and worker environment. The app
publishes durable jobs to `EMAIL_QUEUE_NAME` (`emails` by default), and the worker delivers them with
the selected SMTP or Resend provider.

```sh
pnpm worker:dev    # TypeScript development worker; loads .env
pnpm build         # Builds both the web app and worker
pnpm worker:start  # Runs build/worker/email.worker.js
```

The worker processes up to `RABBITMQ_PREFETCH` jobs concurrently. Invalid jobs are discarded.
Failed provider deliveries are discarded by default; set `RABBITMQ_REQUEUE_ON_FAILURE=true` only
if repeated retries are desired.

RabbitMQ connection and publishing live in the generic `app/features/queue` feature. The email
feature depends only on its public `enqueue` helper and keeps the email queue name in
`EMAIL_QUEUE_NAME`.

## Test API

The template test endpoint is restricted to administrators and, by default, is only reachable when
`NODE_ENV` is not `production`. It can dispatch any template through the configured delivery mode:

```http
POST /api/send/email
Content-Type: application/json

{
  "to": "learner@example.com",
  "template": "account-activation",
  "name": "Ayu",
  "locale": "id"
}
```

Supported template values are `account-activation`, `email-verification`, and `password-reset`.
`actionUrl`, `expiresInMinutes`, and `locale` are optional. Without an `actionUrl`, the API inserts a
clearly non-production test token. Without `locale`, it uses the current request language. Successful
responses include a `traceId`. Failed SMTP responses include the same value in the JSON body and
`X-Email-Trace-Id` header so the request can be matched to the server logs. In RabbitMQ mode, the
returned message ID starts with `queued:`. `GET /api/send/email` returns `405 Method Not Allowed`.

## Delivery logs

Every delivery writes structured `[Email]` log entries for `Delivery started`, `Delivery succeeded`,
`Delivery failed`, or `Email preparation failed`. Use the `traceId` to follow one attempt. Failure
logs include provider error details, duration, and stack trace when available. SMTP passwords,
Resend API keys, message bodies, action URLs, and
complete recipient addresses are never logged.
