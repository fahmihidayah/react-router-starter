import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import {
  EmailDeliveryError,
  isEmailConfigured,
  isTestEmailEndpointEnabled,
  resolveEmailLocale,
  sendAccountActivationEmail,
  sendEmailVerification,
  sendPasswordResetEmail,
} from '~/features/email/index.server'
import { checkRateLimit, rateLimitHeaders } from '~/features/security/rate-limit.server'
import { requireApiAdmin } from '~/features/users/middlewares'
import { createErrorResponse, createSuccessResponse, toJsonResponse } from '~/lib/types'
import type { Route } from './+types/send.email'

/**
 * Hides the template test endpoint in production unless it is explicitly enabled.
 * It runs before the admin guard so the endpoint cannot be probed by other users.
 */
const requireTestEmailEnabled: Route.MiddlewareFunction = async (_args, next) => {
  if (!isTestEmailEndpointEnabled()) {
    throw toJsonResponse(createErrorResponse('Not found', 404))
  }

  return next()
}

export const middleware: Route.MiddlewareFunction[] = [requireTestEmailEnabled, requireApiAdmin]

const testEmailSchema = z
  .object({
    to: z.string().trim().email('Enter a valid recipient email address'),
    template: z.enum(['account-activation', 'email-verification', 'password-reset']),
    name: z.string().trim().min(1, 'Name cannot be empty').max(100).optional(),
    actionUrl: z.string().url('Action URL must be a valid URL').optional(),
    expiresInMinutes: z.number().int().min(1).max(1_440).optional(),
    locale: z.enum(['en', 'id']).optional(),
  })
  .strict()

function testActionUrl(request: Request, template: z.infer<typeof testEmailSchema>['template']) {
  const baseUrl = process.env.BETTER_AUTH_URL || new URL(request.url).origin
  const path =
    template === 'password-reset'
      ? '/reset-password?token=email-template-test'
      : '/api/auth/verify-email?token=email-template-test'

  return new URL(path, baseUrl).toString()
}

export async function action({ request }: Route.ActionArgs) {
  if (!request.headers.get('content-type')?.includes('application/json')) {
    return toJsonResponse(createErrorResponse('Content-Type must be application/json.', 415))
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return toJsonResponse(createErrorResponse('Request body must be valid JSON.', 400))
  }

  const parsed = testEmailSchema.safeParse(body)
  if (!parsed.success) {
    return toJsonResponse(createErrorResponse(parsed.error.flatten().fieldErrors, 400))
  }

  const limit = await checkRateLimit(request, {
    max: 10,
    scope: 'test-email',
    subjects: [parsed.data.to],
    windowSeconds: 15 * 60,
  })
  if (!limit.allowed) {
    return Response.json(
      { success: false, error: 'Too many email requests. Try again later.' },
      { status: 429, headers: rateLimitHeaders(limit.retryAfterSeconds) },
    )
  }

  if (!isEmailConfigured()) {
    return toJsonResponse(
      createErrorResponse('Email delivery is not configured. Check the email environment.', 503),
    )
  }

  const { actionUrl, expiresInMinutes, name, template, to } = parsed.data
  const locale = parsed.data.locale ?? resolveEmailLocale(request)
  const url = actionUrl || testActionUrl(request, template)
  const traceId = randomUUID()

  try {
    let messageId: string

    switch (template) {
      case 'account-activation':
        messageId = await sendAccountActivationEmail(
          {
            activationUrl: url,
            email: to,
            expiresInMinutes,
            locale,
            name,
          },
          { traceId },
        )
        break
      case 'email-verification':
        messageId = await sendEmailVerification(
          {
            email: to,
            expiresInMinutes,
            locale,
            name,
            verificationCode: '482913',
            verificationUrl: url,
          },
          { traceId },
        )
        break
      case 'password-reset':
        messageId = await sendPasswordResetEmail(
          {
            email: to,
            expiresInMinutes,
            locale,
            name,
            resetUrl: url,
          },
          { traceId },
        )
        break
    }

    return toJsonResponse(
      createSuccessResponse({
        message: 'Test email sent.',
        messageId,
        recipient: to,
        template,
        traceId,
      }),
    )
  } catch (error) {
    const failedTraceId = error instanceof EmailDeliveryError ? error.traceId : traceId
    return Response.json(
      {
        success: false,
        error: 'The email could not be sent.',
        traceId: failedTraceId,
      },
      {
        status: 502,
        headers: { 'X-Email-Trace-Id': failedTraceId },
      },
    )
  }
}

export function loader() {
  return Response.json(
    { success: false, error: 'Method not allowed. Use POST.' },
    { status: 405, headers: { Allow: 'POST' } },
  )
}
