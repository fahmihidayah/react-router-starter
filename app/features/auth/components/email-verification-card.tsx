import { ArrowRight, CircleCheck, MailCheck, RefreshCw, TriangleAlert } from 'lucide-react'
import { Form, Link } from 'react-router'
import { Button } from '~/components/ui/button'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import * as m from '~/paraglide/messages.js'
import { AuthCard } from './auth-shell'

export type EmailVerificationState = 'pending' | 'success' | 'expired' | 'invalid'

type EmailVerificationCardProps = {
  state: EmailVerificationState
  email?: string
  continuePath?: string
  isSubmitting?: boolean
  response?: {
    success: boolean
    message: string
    errors?: { email?: string[] }
  }
}

const stateContent = {
  pending: {
    title: m.verification_pending_title,
    description: m.verification_pending_description,
    Icon: MailCheck,
    iconClassName: 'bg-primary/10 text-primary',
  },
  success: {
    title: m.verification_success_title,
    description: m.verification_success_description,
    Icon: CircleCheck,
    iconClassName: 'bg-brand-mint/25 text-emerald-700',
  },
  expired: {
    title: m.verification_expired_title,
    description: m.verification_expired_description,
    Icon: TriangleAlert,
    iconClassName: 'bg-amber-100 text-amber-700',
  },
  invalid: {
    title: m.verification_invalid_title,
    description: m.verification_invalid_description,
    Icon: TriangleAlert,
    iconClassName: 'bg-destructive/10 text-destructive',
  },
} as const

export function EmailVerificationCard({
  state,
  email,
  continuePath = '/login',
  isSubmitting = false,
  response,
}: EmailVerificationCardProps) {
  const content = stateContent[state]
  const Icon = content.Icon
  const emailError = response?.errors?.email?.[0]

  return (
    <AuthCard
      title={content.title()}
      description={content.description()}
      footer={
        state === 'success' ? null : (
          <p className="w-full text-center text-sm text-muted-foreground">
            <Link to="/login" className="font-medium text-primary hover:underline">
              {m.verification_back_to_login()}
            </Link>
          </p>
        )
      }
    >
      <div className="space-y-6">
        <div className={`grid size-14 place-items-center rounded-2xl ${content.iconClassName}`}>
          <Icon className="size-7" aria-hidden="true" />
        </div>

        {state === 'success' ? (
          <Button asChild size="lg" className="w-full">
            <Link to={continuePath}>
              {continuePath === '/login'
                ? m.verification_continue_to_login()
                : m.verification_continue_to_tracker()}
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        ) : (
          <>
            {state === 'pending' ? (
              <ol className="space-y-3 rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                <li className="flex gap-3">
                  <span className="font-bold text-primary">1.</span>
                  <span>{m.verification_step_open_email()}</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">2.</span>
                  <span>{m.verification_step_click_link()}</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold text-primary">3.</span>
                  <span>{m.verification_step_continue()}</span>
                </li>
              </ol>
            ) : null}

            <div className="space-y-3 border-t pt-5">
              <p className="text-sm leading-6 text-muted-foreground">
                {m.verification_resend_help()}
              </p>
              <Form method="post" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verification-email">{m.auth_email()}</Label>
                  <Input
                    id="verification-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    defaultValue={email}
                    placeholder={m.auth_email_placeholder()}
                    aria-describedby={emailError ? 'verification-email-error' : undefined}
                    aria-invalid={emailError ? true : undefined}
                    required
                    disabled={isSubmitting}
                  />
                  {emailError ? (
                    <p
                      id="verification-email-error"
                      role="alert"
                      className="text-sm text-destructive"
                    >
                      {emailError}
                    </p>
                  ) : null}
                </div>

                {response?.message ? (
                  <p
                    role={response.success ? 'status' : 'alert'}
                    className={`rounded-lg border px-4 py-3 text-sm ${
                      response.success
                        ? 'border-brand-mint/40 bg-accent text-accent-foreground'
                        : 'border-destructive/30 bg-destructive/10 text-destructive'
                    }`}
                  >
                    {response.message}
                  </p>
                ) : null}

                <Button
                  type="submit"
                  variant="outline"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  <RefreshCw
                    className={isSubmitting ? 'animate-spin' : undefined}
                    aria-hidden="true"
                  />
                  {isSubmitting ? m.verification_resending() : m.verification_resend_button()}
                </Button>
              </Form>
            </div>
          </>
        )}
      </div>
    </AuthCard>
  )
}
