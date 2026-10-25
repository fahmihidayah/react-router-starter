import {
  data,
  Form,
  Link,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from 'react-router'
import z from 'zod'
import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { PasswordInput } from '~/components/ui/password-input'
import { AuthCard, AuthShell } from '~/features/auth/components/auth-shell'
import { checkRateLimit, rateLimitHeaders } from '~/features/security/rate-limit.server'
import { auth } from '~/lib/auth'
import * as m from '~/paraglide/messages.js'
import type { Route } from './+types/reset-password'

type TResetPasswordActionData = {
  error: string
}

export function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  return {
    invalid: Boolean(url.searchParams.get('error')),
    token: url.searchParams.get('token'),
  }
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData()
  const result = z
    .object({
      token: z.string().min(1),
      password: z.string().min(8).max(128),
      confirmPassword: z.string().min(1),
    })
    .refine((value) => value.password === value.confirmPassword, {
      path: ['confirmPassword'],
    })
    .safeParse(Object.fromEntries(formData))

  if (!result.success) {
    return data<TResetPasswordActionData>(
      { error: m.reset_password_validation_error() },
      { status: 400 },
    )
  }

  const limit = await checkRateLimit(request, {
    max: 5,
    scope: 'reset-password',
    subjects: [result.data.token],
    windowSeconds: 15 * 60,
  })
  if (!limit.allowed) {
    return data<TResetPasswordActionData>(
      { error: m.auth_rate_limit_exceeded() },
      { status: 429, headers: rateLimitHeaders(limit.retryAfterSeconds) },
    )
  }

  try {
    await auth.api.resetPassword({
      body: {
        newPassword: result.data.password,
        token: result.data.token,
      },
      headers: request.headers,
    })
  } catch (error: unknown) {
    console.error('[Reset Password] Failed to reset password', error)
    return data<TResetPasswordActionData>(
      { error: m.reset_password_invalid_link() },
      { status: 400 },
    )
  }

  return redirect('/login?passwordReset=success')
}

export function meta() {
  return [
    { title: m.reset_password_meta_title() },
    { name: 'description', content: m.reset_password_meta_description() },
  ]
}

export default function ResetPassword() {
  const { invalid, token } = useLoaderData<typeof loader>()
  const actionData = useActionData<TResetPasswordActionData>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  if (invalid || !token) {
    return (
      <AuthShell>
        <AuthCard
          title={m.reset_password_link_invalid_title()}
          description={m.reset_password_link_invalid_description()}
          footer={
            <Button asChild className="w-full">
              <Link to="/forgot-password">{m.reset_password_request_new_link()}</Link>
            </Button>
          }
        >
          <p className="text-sm text-muted-foreground">{m.reset_password_link_invalid_help()}</p>
        </AuthCard>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <AuthCard title={m.reset_password_title()} description={m.reset_password_description()}>
        <Form method="post" className="space-y-5">
          <input type="hidden" name="token" value={token} />
          <div className="space-y-2">
            <Label htmlFor="password">{m.reset_password_new_password()}</Label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              minLength={8}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{m.register_confirm_password()}</Label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              minLength={8}
              required
              disabled={isSubmitting}
            />
          </div>

          {actionData?.error ? (
            <p
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              {actionData.error}
            </p>
          ) : null}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? m.reset_password_submitting() : m.reset_password_submit()}
          </Button>
        </Form>
      </AuthCard>
    </AuthShell>
  )
}
