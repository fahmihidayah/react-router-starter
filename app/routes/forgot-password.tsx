import { Form, Link, useActionData, useNavigation } from 'react-router'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { AuthCard, AuthShell } from '~/features/auth/components/auth-shell'
import { redirectAuthenticatedUser } from '~/features/auth/loaders/redirect-authenticated-user'
import {
  forgotPasswordAction,
  type TForgotPasswordActionResponse,
} from '~/features/users/actions/forgot-password-action'
import * as m from '~/paraglide/messages.js'
import type { Route } from './+types/forgot-password'

export function loader({ request }: Route.LoaderArgs) {
  return redirectAuthenticatedUser(request)
}

export function action(args: Route.ActionArgs) {
  return forgotPasswordAction(args)
}

export function meta() {
  return [
    { title: m.forgot_password_meta_title() },
    { name: 'description', content: m.forgot_password_meta_description() },
  ]
}

export default function ForgotPassword() {
  const actionData = useActionData<TForgotPasswordActionResponse>()
  const navigation = useNavigation()
  const isSubmitting = navigation.state === 'submitting'

  return (
    <AuthShell>
      <AuthCard
        title={m.forgot_password_title()}
        description={m.forgot_password_description()}
        footer={
          <p className="w-full text-center text-sm text-muted-foreground">
            <Link to="/login" className="font-medium text-primary hover:underline">
              {m.forgot_password_back_to_login()}
            </Link>
          </p>
        }
      >
        <Form method="post" className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">{m.auth_email()}</Label>
            <Input
              className="h-11"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder={m.auth_email_placeholder()}
              aria-describedby={actionData?.errors?.email ? 'email-error' : undefined}
              required
              disabled={isSubmitting}
            />
            {actionData?.errors?.email?.[0] ? (
              <p id="email-error" className="text-sm text-destructive">
                {actionData.errors.email[0]}
              </p>
            ) : null}
          </div>

          {actionData?.message ? (
            <p
              className={`rounded-lg border px-4 py-3 text-sm ${
                actionData.success
                  ? 'border-brand-mint/40 bg-accent text-accent-foreground'
                  : 'border-destructive/30 bg-destructive/10 text-destructive'
              }`}
              role="status"
            >
              {actionData.message}
            </p>
          ) : null}

          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? m.forgot_password_submitting() : m.forgot_password_submit()}
          </Button>
        </Form>
      </AuthCard>
    </AuthShell>
  )
}
